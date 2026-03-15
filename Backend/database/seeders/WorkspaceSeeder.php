<?php

namespace Database\Seeders;

use App\Models\Workspace;
use Database\Factories\WorkspaceFactory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WorkspaceSeeder extends Seeder
{
    
    public function run()
    {
             Workspace::factory(10)->create();       
    }
}
