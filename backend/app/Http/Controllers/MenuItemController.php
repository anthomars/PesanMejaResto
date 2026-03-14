<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => MenuItem::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:food,drink'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $item = MenuItem::query()->create([
            ...$payload,
            'is_available' => $payload['is_available'] ?? true,
        ]);

        return response()->json([
            'message' => 'Menu berhasil ditambahkan.',
            'data' => $item,
        ], 201);
    }

    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:food,drink'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['required', 'boolean'],
        ]);

        $menuItem->update($payload);

        return response()->json([
            'message' => 'Menu berhasil diperbarui.',
            'data' => $menuItem->fresh(),
        ]);
    }

    public function destroy(MenuItem $menuItem): JsonResponse
    {
        if ($menuItem->orderItems()->exists()) {
            return response()->json([
                'message' => 'Menu yang sudah dipakai dalam order tidak bisa dihapus.',
            ], 422);
        }

        $menuItem->delete();

        return response()->json([
            'message' => 'Menu berhasil dihapus.',
        ]);
    }
}
