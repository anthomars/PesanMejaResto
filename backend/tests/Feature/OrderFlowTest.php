<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_waiter_can_open_add_items_and_close_order(): void
    {
        $this->seed();

        $login = $this->postJson('/api/login', [
            'email' => 'waiter@resto.test',
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');

        $tableId = $this->getJson('/api/tables')->json('data.0.id');
        $menuItemId = $this->withToken($token)->getJson('/api/menu-items')->json('data.0.id');

        $order = $this->withToken($token)->postJson('/api/orders', [
            'restaurant_table_id' => $tableId,
        ])->assertCreated();

        $orderId = $order->json('data.id');

        $this->withToken($token)->postJson('/api/orders/'.$orderId.'/items', [
            'menu_item_id' => $menuItemId,
            'quantity' => 2,
        ])->assertOk();

        $this->withToken($token)->postJson('/api/orders/'.$orderId.'/close')
            ->assertOk()
            ->assertJsonPath('data.status', 'closed');
    }

    public function test_cashier_cannot_create_menu_or_open_order(): void
    {
        $this->seed();

        $login = $this->postJson('/api/login', [
            'email' => 'cashier@resto.test',
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');
        $tableId = $this->getJson('/api/tables')->json('data.0.id');

        $this->withToken($token)->postJson('/api/menu-items', [
            'name' => 'Menu Kasir',
            'category' => 'food',
            'price' => 12000,
            'is_available' => true,
        ])->assertForbidden();

        $this->withToken($token)->postJson('/api/orders', [
            'restaurant_table_id' => $tableId,
        ])->assertForbidden();
    }

    public function test_waiter_cannot_open_receipt_pdf(): void
    {
        $this->seed();

        $login = $this->postJson('/api/login', [
            'email' => 'waiter@resto.test',
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');
        $tableId = $this->getJson('/api/tables')->json('data.0.id');
        $orderId = $this->withToken($token)->postJson('/api/orders', [
            'restaurant_table_id' => $tableId,
        ])->json('data.id');

        $menuItemId = $this->withToken($token)->getJson('/api/menu-items')->json('data.0.id');

        $this->withToken($token)->postJson('/api/orders/'.$orderId.'/items', [
            'menu_item_id' => $menuItemId,
            'quantity' => 1,
        ])->assertOk();

        $this->withToken($token)->get('/api/orders/'.$orderId.'/receipt')
            ->assertForbidden();
    }
}
