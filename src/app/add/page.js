"use client"

import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Loader2, PlusCircle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WellnessCheck from '@/components/WellnessCheck';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useAnalysis } from '@/hooks/useAnalysis';

const AddFood = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  
  const webcamRef = React.useRef(null);
  const { addEntry } = useFoodHistory();
  const { analyzing, results, analyzeFood, setResults } = useAnalysis();

  const resetForm = () => {
    setPhoto(null);
    setResults(null);
    if (document.getElementById('food-description')) {
      document.getElementById('food-description').value = '';
    }
  };

  const handleFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please choose an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
    }
  };

  const handleSave = () => {
    const newEntry = {
      date: new Date().toLocaleString(),
      food: results.mainItem,
      ingredients: results.ingredients.join(", "),
      sensitivities: results.sensitivities || [],
      type: 'food'
    };
    addEntry(newEntry);
    resetForm();
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Wellness Check Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowWellnessCheck(true)}
          variant="outline"
          size="lg"
          className="w-full border-2 border-green-500 text-green-600 hover:bg-green-50"
        >
          <Info className="w-5 h-5 mr-2" />
          How am I feeling?
        </Button>
      </div>

      {/* Main Add Food Card */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          {/* Input Methods */}
          {!photo && !analyzing && !results && (
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="text" className="flex-1">Enter Text</TabsTrigger>
                <TabsTrigger value="photo" className="flex-1">Take Photo</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <div className="space-y-4">
                  <textarea
                    id="food-description"
                    placeholder="What did you eat? (e.g., 'Grilled chicken salad with avocado')"
                    className="w-full p-3 border rounded-lg resize-none text-base"
                    rows="3"
                  />
                  <Button 
                    onClick={() => {
                      const description = document.getElementById('food-description')?.value?.trim();
                      if (!description) {
                        setError('Please provide a description');
                        return;
                      }
                      analyzeFood(description, null);
                    }}
                    className="w-full"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Food
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="photo">
                <div className="space-y-4">
                  {!showCamera ? (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => setShowCamera(true)} 
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Open Camera
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        Choose from Library
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                          facingMode: { exact: "environment" }
                        }}
                        className="w-full h-[400px] object-cover"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button onClick={handlePhotoCapture}>Take Photo</Button>
                        <Button variant="destructive" onClick={() => setShowCamera(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Photo Review */}
          {photo && !analyzing && !results && (
            <div className="space-y-4">
              <img src={photo} alt="Food" className="w-full rounded-lg shadow" />
              <div className="space-y-3">
                <textarea
                  id="food-description"
                  placeholder="Add any details about the food (optional)"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="2"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      const description = document.getElementById('food-description')?.value?.trim();
                      analyzeFood(description, photo);
                    }}
                    className="flex-1"
                  >
                    Analyze Photo
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setPhoto(null)}
                    className="flex-1"
                  >
                    Retake
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analyzing && (
            <div className="py-8">
              <div className="flex flex-col items-center justify-center gap-3 text-blue-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-lg">Analyzing your food...</p>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{results.mainItem}</h3>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium mb-2">Ingredients:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {results.sensitivities?.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Contains:</p>
                      <div className="flex flex-wrap gap-1">
                        {results.sensitivities.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleSave}
                  className="flex-1"
                >
                  Save Entry
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Start Over
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wellness Check Modal */}
      {showWellnessCheck && (
        <WellnessCheck
          onClose={() => setShowWellnessCheck(false)}
          onSubmit={(entry) => {
            addEntry(entry);
            setShowWellnessCheck(false);
          }}
        />
      )}
    </div>
  );
};

export default AddFood;