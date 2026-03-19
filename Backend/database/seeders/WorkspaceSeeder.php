<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;

class WorkspaceSeeder extends Seeder
{
    public function run()
    {
        
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->command->error('No users found! Run UserSeeder first.');
            return;
        }
        
        $this->command->info('Creating workspaces for ' . $users->count() . ' users...');
        
     
        for ($i = 0; $i < 10; $i++) {
            $randomUser = $users->random();
            
            Workspace::factory()
                ->forUser($randomUser->id) 
                ->create();
        }
        
       
        $this->command->info('Created 40 workspaces');
    }
}