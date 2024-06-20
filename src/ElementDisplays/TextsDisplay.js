import React, {useContext, useEffect, useState} from 'react';
import {GlobalStateContext} from '../GlobalStateContext';
import ConnectApiDialog from "./ConnectApiDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";

function TextsDisplay() {
    const {
        jsonData,
        texts,
        setTexts,
        originalTexts,
        textsLayerNames,
        setJsonData,
        textShowAll,
        setTextShowAll,
        externalSources,
        setExternalSources,
        textObjects,
        setTextObjects,
        apis, setApis
    } = useContext(GlobalStateContext);
    const [showOptionMenuIndex, setShowOptionMenuIndex] = useState(null);

    useEffect(() => {
        setTexts(texts);
    }, [setTexts, texts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.text-option-dropdown')) {
                setShowOptionMenuIndex(null);
            }
        };

        if (showOptionMenuIndex != null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionMenuIndex]);

    const updateLottieText = (index, newText) => {
        if (!jsonData) {
            console.error("No valid Lottie or Data.");
            return;
        }

        const tempJsonData = jsonData;
        let currentTextIndex = 0;

        function searchAndUpdateText(obj) {
            if (typeof obj === "object" && obj !== null) {
                if (obj.t && obj.t.d && obj.t.d.k) {
                    obj.t.d.k.forEach((item) => {
                        if (item.s && currentTextIndex === index) {
                            //console.log("Updating text at index:", currentTextIndex);
                            item.s.t = newText;
                        }
                        currentTextIndex++;
                    });
                }

                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        searchAndUpdateText(obj[key]);
                    }
                }
            }
        }

        if (texts) {
            searchAndUpdateText(tempJsonData);
        }

        setJsonData(tempJsonData);

        const updatedTexts = [...texts];
        updatedTexts[index] = newText;
        setTexts(updatedTexts);
    };

    const toggleTextShowAll = () => {
        setTextShowAll(!textShowAll);
    };

    const toggleExternalSources = () => {
        setExternalSources(!externalSources);
    };

    const handleSelect = (action, textObject) => {
        console.log("Selected Action:", action);

        if (action === "external" || action === "text") {
            const updatedTextObjects = [...textObjects];
            const index = textObjects.findIndex(t => t === textObject);
            if (index !== -1) {
                updatedTextObjects[index].type = action;
                setTextObjects(updatedTextObjects);
            }
        }

        if (action === "change") {

        }

        setShowOptionMenuIndex(null);
    };

    const handleSourceChange = (value) => {
        console.log(value);
    }

    /*const filteredTexts = texts && textsLayerNames && textsLayerNames.filter((textLayerName, i) => {
        return textShowAll || textsLayerNames[i].startsWith('_');
    });*/

    const filteredTexts = textObjects.filter((textObject) => {
        return textShowAll || textObject.layername.startsWith('_');
    });


    return (
        <>
            <div className="controls">
                <div className="control-item">
                    <label htmlFor="textShowAll">Show All</label>
                    <input
                        type="checkbox"
                        title="Show all"
                        id="textShowAll"
                        checked={textShowAll}
                        onChange={toggleTextShowAll}
                    />
                </div>
                <div className="control-item">
                    <label htmlFor="api-dialog-check">External Sources</label>
                    <input
                        type="checkbox"
                        title="Connect API"
                        id="api-dialog-check"
                        checked={externalSources}
                        onChange={toggleExternalSources}
                    />
                </div>
            </div>
            <ConnectApiDialog/>
            <div id="text-inputs" className="text-inputs">
                {filteredTexts.map((textObject, i) => {
                    const index = textObjects.indexOf(textObject);
                    const textTitle = "Original: " + textObject.original;
                    return (
                        <div key={i} className="jsonText">
                            <label className="text-layer-name">{textObject.layername}</label>
                            {textObject.type === "text" && (
                                <input
                                    type="text"
                                    title={textTitle}
                                    data-index={index}
                                    value={texts[index]}
                                    onChange={(e) => updateLottieText(index, e.target.value)}
                                />
                            )}
                            {textObject.type === "external" && (
                                <select onChange={e => handleSourceChange(e.target.value)}>
                                    {apis.map((api, i) => {
                                        return (
                                            <option key={i}>{i}</option>
                                        )
                                    })}
                                </select>
                            )}
                            <div className="option-button-wrapper">
                                <button className="option-button"
                                        onClick={() => setShowOptionMenuIndex(showOptionMenuIndex === i ? null : i)}>
                                    <FontAwesomeIcon icon={faEllipsisVertical}/>
                                </button>
                                {showOptionMenuIndex === i && (
                                    <div className="text-option-dropdown">
                                        <ul>
                                            {textObject.type === "text" && externalSources && (
                                                <li onClick={() => handleSelect("external", textObject)}
                                                    className="text-option-item">Connect External Source
                                                </li>
                                            )}
                                            {textObject.type === "external" && externalSources && (
                                                <li onClick={() => handleSelect("text", textObject)}
                                                    className="text-option-item">Connect Text
                                                </li>
                                            )}
                                            <li onClick={() => handleSelect("change", textObject)}
                                                className="text-option-item">Change Layer Name
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default TextsDisplay;
