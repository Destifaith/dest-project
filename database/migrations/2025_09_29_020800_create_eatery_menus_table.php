<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('eatery_menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('eatery_id')->constrained()->onDelete('cascade');
            $table->date('menu_date');
            $table->enum('source_type', ['pdf', 'image'])->nullable();
            $table->string('source_file')->nullable(); // e.g., 'eateries/menus/123_2024-06-15.pdf'
            $table->text('extracted_text')->nullable();
            $table->json('structured_menu')->nullable(); // e.g., { "lunch": [ { "name": "Jollof Rice", "price": "₦1500" } ] }
            $table->enum('status', ['pending', 'processed', 'failed', 'active'])->default('pending');
            $table->timestamps();

            $table->unique(['eatery_id', 'menu_date']); // One menu per eatery per day
        });
    }

    public function down()
    {
        Schema::dropIfExists('eatery_menus');
    }
};
