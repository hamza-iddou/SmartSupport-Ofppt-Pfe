<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        
        User::factory(5)->create();
        
        
        User::factory()->create([
            'name' => 'hamza',
            'last_name' => 'iddou',
            'email' => 'hamzaiddou@gmail.com',
            'password' => 'password123' // The User model will hash this automatically
        ]);
        
        $this->command->info('Created 25 users');
    }
}