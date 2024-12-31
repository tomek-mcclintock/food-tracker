import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AnalysisTest() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const runTest = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
      const base64Data = image.split('base64,')[1];
      
      // Get Clarifai-only results
      const clarifaiResponse = await fetch('/api/test/clarifai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      const clarifaiResults = await clarifaiResponse.json();

      // Get Claude-only results
      const claudeResponse = await fetch('/api/test/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      const claudeResults = await claudeResponse.json();

      // Get combined results
      const combinedResponse = await fetch('/api/test/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      const combinedResults = await combinedResponse.json();

      setResults({
        clarifai: clarifaiResults,
        claude: claudeResults,
        combined: combinedResults
      });
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Food Analysis Test</h1>
      
      <div className="flex gap-4 items-center">
        <Button onClick={() => document.getElementById('imageInput').click()}>
          Select Image
        </Button>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
        />
        <Button onClick={runTest} disabled={!image || loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Run Analysis
        </Button>
      </div>

      {image && (
        <img src={image} alt="Test food" className="max-h-64 rounded-lg" />
      )}

      {results && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Clarifai Only</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.clarifai, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claude Only</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.claude, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Combined</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.combined, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}