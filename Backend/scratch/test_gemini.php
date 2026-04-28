<?php

require 'vendor/autoload.php';

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Facade;
use Illuminate\Events\Dispatcher;
use Illuminate\Container\Container;

// Minimal setup to use Laravel's Http facade standalone
$container = new Container();
Facade::setFacadeApplication($container);
$container->singleton('events', function () {
    return new Dispatcher();
});
$container->singleton('http', function () {
    return new \Illuminate\Http\Client\Factory();
});

$apiKey = 'AIzaSyCvf8OLQPBCJIAm7BgNYK2iVZqJZheZjPY';
$baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

echo "Testing Gemini API Key...\n";

try {
    $response = \Illuminate\Support\Facades\Http::post($baseUrl . '?key=' . $apiKey, [
        'contents' => [
            [
                'parts' => [
                    ['text' => 'Hello, are you working?']
                ]
            ]
        ]
    ]);

    if ($response->successful()) {
        echo "SUCCESS!\n";
        print_r($response->json());
    } else {
        echo "FAILED!\n";
        echo "Status: " . $response->status() . "\n";
        echo "Body: " . $response->body() . "\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
