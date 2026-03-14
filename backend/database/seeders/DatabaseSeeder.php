<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->create([
            'name' => 'Pelayan Demo',
            'email' => 'waiter@resto.test',
            'role' => 'waiter',
            'password' => Hash::make('password'),
        ]);

        User::query()->create([
            'name' => 'Kasir Demo',
            'email' => 'cashier@resto.test',
            'role' => 'cashier',
            'password' => Hash::make('password'),
        ]);

        $tables = collect(range(1, 10))->map(fn (int $number) => [
            'name' => 'Meja '.$number,
            'seats' => $number <= 4 ? 4 : 6,
            'status' => 'available',
            'created_at' => now(),
            'updated_at' => now(),
        ])->all();

        RestaurantTable::query()->insert($tables);

        MenuItem::query()->insert([
            [
                'name' => 'Nasi Goreng Spesial',
                'category' => 'food',
                'description' => 'Nasi goreng dengan telur, ayam, dan acar.',
                'price' => 32000,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Mie Ayam Bakso',
                'category' => 'food',
                'description' => 'Mie ayam gurih dengan bakso sapi.',
                'price' => 28000,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Es Teh Manis',
                'category' => 'drink',
                'description' => 'Es teh manis dingin.',
                'price' => 8000,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Kopi Susu Gula Aren',
                'category' => 'drink',
                'description' => 'Kopi susu dingin dengan gula aren.',
                'price' => 18000,
                'is_available' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
