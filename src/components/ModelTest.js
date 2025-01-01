import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ModelTest = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    clarifai: null,
    haiku: { withClarifai: null, withoutClarifai: null },
    sonnet: { withClarifai: null, withoutClarifai: null },
    gpt4: { withClarifai: null, withoutClarifai: null }
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getEndpoint = (model, withClarifai) => {
    if (model === 'gpt4') {
      return withClarifai ? '/api/test/gpt4Test' : '/api/test/gpt4';
    }
    return withClarifai ? '/api/test/combinedTest' : '/api/test/claude';
  };  

  const runTest = async () => {
    if (!image) return;
    setLoading(true);
    const base64Data = image.split('base64,')[1];
    
    try {
      // Test Clarifai
      const clarifaiResponse = await fetch('/api/test/clarifai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data })
      });
      const clarifaiResults = await clarifaiResponse.json();
      setResults(prev => ({ ...prev, clarifai: clarifaiResults }));

      // Test each Claude model with and without Clarifai
      const models = ['haiku', 'sonnet', 'gpt4'];
      
      for (const model of models) {
// Without Clarifai
        const withoutClarifaiResponse = await fetch(getEndpoint(model, false), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
            image: base64Data,
            model: model 
            })
        });
        
        // With Clarifai
        const withClarifaiResponse = await fetch(getEndpoint(model, true), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
            image: base64Data,
            model: model 
            })
        });
        const withClarifaiResults = await withClarifaiResponse.json();

        setResults(prev => ({
          ...prev,
          [model]: {
            withClarifai: withClarifaiResults,
            withoutClarifai: withoutClarifaiResults
          }
        }));
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const ModelResults = ({ modelResults, title }) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="without">
          <TabsList className="w-full">
            <TabsTrigger value="without" className="flex-1">Without Clarifai</TabsTrigger>
            <TabsTrigger value="with" className="flex-1">With Clarifai</TabsTrigger>
          </TabsList>
          <TabsContent value="without">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
              {JSON.stringify(modelResults?.withoutClarifai, null, 2)}
            </pre>
          </TabsContent>
          <TabsContent value="with">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
              {JSON.stringify(modelResults?.withClarifai, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Food Analysis Model Comparison</h1>
      
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

      {results.clarifai && (
        <Card>
          <CardHeader>
            <CardTitle>Clarifai Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
              {JSON.stringify(results.clarifai, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {results.haiku.withoutClarifai && (
        <ModelResults modelResults={results.haiku} title="Claude 3 Haiku Results" />
      )}

      {results.sonnet.withoutClarifai && (
        <ModelResults modelResults={results.sonnet} title="Claude 3 Sonnet Results" />
      )}

        {results.gpt4.withoutClarifai && (
        <ModelResults modelResults={results.gpt4} title="GPT-4 Vision Results" />
        )}

    </div>
  );
};

export default ModelTest;