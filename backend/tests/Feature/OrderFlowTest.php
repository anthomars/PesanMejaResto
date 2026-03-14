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
}
