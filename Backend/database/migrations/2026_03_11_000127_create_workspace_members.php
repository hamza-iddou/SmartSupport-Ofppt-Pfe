<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up()
    {
        Schema::create('workspace_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained("workspaces", "id")->onDelete('cascade');
            $table->foreignId('user_id')->constrained("users", "id")->onDelete('cascade');
            $table->boolean('is_admin')->default(false);

            $table->unique(['workspace_id', 'user_id']);
        });
    }

   
    public function down()
    {
        Schema::dropIfExists('workspaces_members');
    }
};
