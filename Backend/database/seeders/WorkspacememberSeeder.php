<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Database\Seeder;

class WorkspaceMemberSeeder extends Seeder
{
    public function run()
    {
        \App\Models\WorkspaceMember::factory(20)->create();
        
        $workspaces = Workspace::all();
        $users = User::all();
        
        foreach($workspaces as $workspace) {
            $randomUsers = $users->random(rand(3, 5));
            
            foreach($randomUsers as $user) {
                \App\Models\WorkspaceMember::create([
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                    'is_admin' => rand(0, 100) < 30 // 30% chance admin
                ]);
            }
        }
    }
}