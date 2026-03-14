<?php

namespace App\Http\Controllers;

use App\Models\RestaurantTable;
use Illuminate\Http\JsonResponse;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = RestaurantTable::query()
            ->with(['activeOrder.items'])
            ->orderBy('name')
            ->get()
            ->map(function (RestaurantTable $table) {
                return [
                    'id' => $table->id,
                    'name' => $table->name,
                    'seats' => $table->seats,
                    'status' => $table->status,
                    'active_order' => $table->activeOrder ? [
                        'id' => $table->activeOrder->id,
                        'code' => $table->activeOrder->code,
                        'total_items' => $table->activeOrder->items->sum('quantity'),
                    ] : null,
                ];
            });

        return response()->json([
            'data' => $tables,
        ]);
    }
}
