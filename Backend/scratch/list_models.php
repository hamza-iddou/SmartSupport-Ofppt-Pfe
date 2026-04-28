<?php

require 'vendor/autoload.php';

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Facade;
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;

$container = new Container();
Facade::setFacadeApplication($container);
$container->singleton('events', function () {
    return new Dispatcher();
});
$container->singleton('http', function () {
    return new \Illuminate\Http\Client\Factory();
});

$apiKey = 'AIzaSyBdyVFsOBoCzyo2Yz7lz_RUHmeIyxfSodw';

echo "Listing Models...\n";

try {
    $response = \Illuminate\Support\Facades\Http::get("https://generativelanguage.googleapis.com/v1beta/models?key=" . $apiKey);

    if ($response->successful()) {
        $models = $response->json();
        foreach ($models['models'] as $model) {
            echo "Model: " . $model['name'] . " - Methods: " . implode(', ', $model['supportedGenerationMethods']) . "\n";
        }
    } else {
        echo "FAILED!\n";
        echo "Status: " . $response->status() . "\n";
        echo "Body: " . $response->body() . "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
