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
        $users = User::all();
        $workspaces = Workspace::all();
        
        if ($users->isEmpty() || $workspaces->isEmpty()) {
            $this->command->error('Users or workspaces missing!');
            return;
        }
        
        $this->command->info('Adding members to workspaces...');
        
        foreach ($workspaces as $workspace) {
           
            WorkspaceMember::firstOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'user_id' => $workspace->created_by
                ],
                [
                    'is_admin' => true
                ]
            );
            
           
            $availableUsers = $users->where('id', '!=', $workspace->created_by);
            $memberCount = rand(3, min(7, $availableUsers->count()));
            
            $randomUsers = $availableUsers->random($memberCount);
            
            foreach ($randomUsers as $user) {
                WorkspaceMember::firstOrCreate(
                    [
                        'workspace_id' => $workspace->id,
                        'user_id' => $user->id
                    ],
                    [
                        'is_admin' => fake()->boolean(20) 
                    ]
                );
            }
        }
        
        $this->command->info('Workspace members added successfully!');
    }
}