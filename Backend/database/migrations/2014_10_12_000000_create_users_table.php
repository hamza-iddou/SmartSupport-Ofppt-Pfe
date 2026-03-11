<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->boolean("is_email_verified")->default(false);
            $table->string('password');
            $table->timestamps();
        });
    }
    

    
    public function down()
    {
        Schema::dropIfExists('users');
    }
};
