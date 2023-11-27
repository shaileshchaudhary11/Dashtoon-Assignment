import React, { useState } from "react";
import "./styles.css";

function PanelSelector({ selectedPanel, handlePanelChange }) {
  const panelOptions = Array.from({ length: 10 }, (_, i) => (
    <option key={i + 1} value={i + 1}>
      Panel {i + 1}
    </option>
  ));

  return (
    <div className="panelParent">
      <label htmlFor="panelSelect">Panel:</label>
      <select
        id="panelSelect"
        value={selectedPanel}
        onChange={handlePanelChange}
      >
        {panelOptions}
      </select>
    </div>
  );
}

const ComicDisplay = ({ comicImages }) => {
  return (
    <div className="comic-display">
      {comicImages.map((image, index) => (
        <div key={index} className="com-pan">
          {image && <img src={image} alt={`Panel ${index + 1}`} />}
        </div>
      ))}
    </div>
  );
};


function TextEntry({ selectedPanel, panelText, handleTextChange }) {
  return (
    <div className="panelParent">
      <label htmlFor="text">Enter Text for Panel {selectedPanel}:</label>
      <input
        type="text"
        id="text"
        value={panelText}
        onChange={handleTextChange}
        placeholder="Enter text"
      />
    </div>
  );
}

function MainComp() {
  const [selectedPanel, setSelectedPanel] = useState(1); // Initialize with panel 1
  const [panelText, setPanelText] = useState(""); // Input text for the selected panel
  const [comicImages, setComicImages] = useState(Array(10).fill(null));
  // const [isLoading, setIsLoading] = useState(false);


  async function query(data) {
    // Make a POST request to the Hugging Face API endpoint
    const response = await fetch(
      "https://xdwvg9no7pefghrn.us-east-1.aws.endpoints.huggingface.cloud",
      {
        method: "POST",
        headers: {
          Accept: "image/png",
          Authorization: `Bearer VknySbLLTUjbxXAXCjyfaFIPwUTCeRXbFSOjwRiCxsxFyhbnGjSFalPKrpvvDAaPVzWEevPljilLVDBiTzfIbWFdxOkYJxnOPoHhkkVGzAknaOulWggusSFewzpqsNWM`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
  
    // Check if the response is okay (status code 2xx)
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
  
    // Retrieve the response body as a Blob
    const result = await response.blob();
  
    // Log the result (you might want to remove this in a production environment)
    console.log(result);
  
    // Create a Blob URL from the result and return it
    return URL.createObjectURL(result);
  }
  

  const handleTextChange = (event) => {
    setPanelText(event.target.value);
  };

  const handlePanelChange = (event) => {
    const newSelectedPanel = Number(event.target.value);
    
    // Find the first empty panel before the selected panel
    const firstEmptyPanel = comicImages.findIndex((image, index) => index < newSelectedPanel - 1 && image === null);
  
    // Set the selected panel to the first empty panel or the new selected panel
    setSelectedPanel(firstEmptyPanel !== -1 ? firstEmptyPanel + 1 : newSelectedPanel);
  };
  

  const genCom = async () => {
    setIsLoading(true);
  
    try {
      const image = await query({ inputs: panelText });
      const updatedComicImages = [...comicImages];
  
      // Update the selected panel only if it is still null
      if (updatedComicImages[selectedPanel - 1] === null) {
        updatedComicImages[selectedPanel - 1] = image;
        setComicImages(updatedComicImages);
      }
    } catch (error) {
      console.error("Error generating comic panel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PanelSelector
        selectedPanel={selectedPanel}
        handlePanelChange={handlePanelChange}
      />
      <TextEntry
        selectedPanel={selectedPanel}
        panelText={panelText}
        handleTextChange={handleTextChange}
      />
      <button onClick={genCom}>Generate</button>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ComicDisplay comicImages={comicImages}/>
      )}

      
    </div>
  );
}

export default MainComp;
