<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use App\Services\ReceiptPdfBuilder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->with(['table', 'openedBy', 'closedBy', 'items.menuItem'])
            ->orderByDesc('opened_at')
            ->get();

        return response()->json([
            'data' => $orders,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'restaurant_table_id' => ['required', 'integer', 'exists:restaurant_tables,id'],
        ]);

        $table = RestaurantTable::query()->findOrFail($payload['restaurant_table_id']);

        if ($table->status !== 'available') {
            return response()->json([
                'message' => 'Meja sedang dipakai.',
            ], 422);
        }

        $order = DB::transaction(function () use ($table, $request) {
            $order = Order::query()->create([
                'code' => 'ORD-'.str_pad((string) (Order::query()->count() + 1), 5, '0', STR_PAD_LEFT),
                'restaurant_table_id' => $table->id,
                'opened_by_id' => $request->user()->id,
                'status' => 'open',
                'opened_at' => now(),
                'total_amount' => 0,
            ]);

            $table->update(['status' => 'occupied']);

            return $order->load(['table', 'openedBy', 'items.menuItem']);
        });

        return response()->json([
            'message' => 'Order berhasil dibuka.',
            'data' => $order,
        ], 201);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load(['table', 'openedBy', 'closedBy', 'items.menuItem']);

        return response()->json([
            'data' => $order,
        ]);
    }

    public function addItem(Request $request, Order $order): JsonResponse
    {
        if ($order->status !== 'open') {
            return response()->json([
                'message' => 'Order yang sudah ditutup tidak dapat diubah.',
            ], 422);
        }

        $payload = $request->validate([
            'menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $menuItem = MenuItem::query()->findOrFail($payload['menu_item_id']);

        if (! $menuItem->is_available) {
            return response()->json([
                'message' => 'Menu sedang tidak tersedia.',
            ], 422);
        }

        DB::transaction(function () use ($order, $menuItem, $payload) {
            OrderItem::query()->create([
                'order_id' => $order->id,
                'menu_item_id' => $menuItem->id,
                'quantity' => $payload['quantity'],
                'unit_price' => $menuItem->price,
                'subtotal' => $menuItem->price * $payload['quantity'],
                'notes' => $payload['notes'] ?? null,
            ]);

            $this->refreshTotal($order);
        });

        return response()->json([
            'message' => 'Item berhasil ditambahkan ke order.',
            'data' => $order->fresh()->load(['table', 'openedBy', 'closedBy', 'items.menuItem']),
        ]);
    }

    public function close(Request $request, Order $order): JsonResponse
    {
        if ($order->status !== 'open') {
            return response()->json([
                'message' => 'Order sudah ditutup.',
            ], 422);
        }

        if (! $order->items()->exists()) {
            return response()->json([
                'message' => 'Order belum memiliki item.',
            ], 422);
        }

        DB::transaction(function () use ($order, $request) {
            $this->refreshTotal($order);

            $order->update([
                'status' => 'closed',
                'closed_by_id' => $request->user()->id,
                'closed_at' => now(),
            ]);

            $order->table()->update([
                'status' => 'available',
            ]);
        });

        return response()->json([
            'message' => 'Order berhasil ditutup.',
            'data' => $order->fresh()->load(['table', 'openedBy', 'closedBy', 'items.menuItem']),
        ]);
    }

    public function receipt(Order $order, ReceiptPdfBuilder $receiptPdfBuilder): Response
    {
        $order->load(['table', 'openedBy', 'closedBy', 'items.menuItem']);

        $pdf = $receiptPdfBuilder->build($order);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="receipt-'.$order->code.'.pdf"',
        ]);
    }

    private function refreshTotal(Order $order): void
    {
        $total = $order->items()->sum('subtotal');

        $order->update([
            'total_amount' => $total,
        ]);
    }
}
