<?php

$apiKey = 'AIzaSyCvf8OLQPBCJIAm7BgNYK2iVZqJZheZjPY';

function testAnalyzeTicket($model, $apiKey) {
    echo "Testing analysis with model: $model...\n";
    $url = "https://generativelanguage.googleapis.com/v1/models/{$model}:generateContent?key={$apiKey}";
    
    $prompt = "You are an AI support assistant. Please analyze the following support ticket and return a JSON response with exactly three fields: 
    1. 'summary' (a brief 1-sentence summary)
    2. 'suggestion' (a practical next step for the support team)
    3. 'category' (a 1-2 word category like 'Network', 'Hardware', 'Software', 'Billing', etc.)
    
    Ticket Title: Cannot login to the portal
    Ticket Description: Whenever I try to login to my dashboard, it says Invalid Credentials even though I reset my password.
    
    Return ONLY the JSON object.";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ]
    ]));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Status Code: $httpCode\n";
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
        echo "Raw AI Response:\n$text\n\n";
        
        $cleanJson = preg_replace('/```json|```/', '', $text);
        $decoded = json_decode(trim($cleanJson), true);
        echo "Decoded JSON:\n";
        print_r($decoded);
    } else {
        echo "Error response: $response\n";
    }
}

testAnalyzeTicket('gemini-2.5-flash', $apiKey);
