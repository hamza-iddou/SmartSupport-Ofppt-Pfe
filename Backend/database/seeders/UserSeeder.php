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
        User::factory(2)->unverified()->create();
        User::factory()->create([
                'name' => 'hamza',
                'last_name' => 'iddou',
                'email' => 'hamza@gmail.com',
                'is_email_verified' => true,
                'password' => Hash::make("hamza123"),
        ]);
        
    }
}
