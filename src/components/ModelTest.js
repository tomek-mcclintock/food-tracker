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
    sonnet: { withClarifai: null, withoutClarifai: null },
    gpt4o: { withClarifai: null, withoutClarifai: null }
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
    if (model === 'gpt4o') {
      return withClarifai ? '/api/test/gpt4oTest' : '/api/test/gpt4o';
    }
    return withClarifai ? '/api/test/combinedTest' : '/api/test/claude';
  };  

  const runTest = async () => {
    if (!image) return;
    setLoading(true);
    const base64Data = image.split('base64,')[1];
    
    try {
      // Test each model
      const models = ['sonnet', 'gpt4o'];
      
      for (const model of models) {
        // Without Clarifai only
        const response = await fetch('/api/test/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: base64Data,
            model: model 
          })
        });
        const results = await response.json();
        
        setResults(prev => ({
          ...prev,
          [model]: {
            withoutClarifai: results
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

      {results.sonnet.withoutClarifai && (
        <ModelResults modelResults={results.sonnet} title="Claude 3 Sonnet Results" />
      )}

        {results.gpt4o.withoutClarifai && (
        <ModelResults modelResults={results.gpt4o} title="GPT-4-Vision Results" />
        )}

    </div>
  );
};

export default ModelTest;