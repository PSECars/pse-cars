"use client";
import CarScene from "@/app/configurator/CarScene";
import ColorButton from "@/app/configurator/ColorButton";
import Button from "@/app/components/Button";
import React, {useEffect, useState} from "react";
import {CarFeature, SavedCar} from "@/app/http-client/openapi";
import {SaveConfigurationDialog} from "@/app/configurator/SaveConfigurationDialog";
import {LoadConfigurationDialog} from "@/app/configurator/LoadConfigurationDialog";
import {deleteSavedCar, getSavedCars, saveCar} from "@/app/actions/configurator";

interface StateFulCarFeature extends CarFeature {
  variant: string;
  setVariant: (variant: string) => void;
}

export function CarConfigurator({
                                  features,
                                }: {
  features: CarFeature[]
}) {
  const statefulFeatures = features.map(feature => {
    const [featureState, setFeatureState] = useState(feature.variants![0]);
    (feature as StateFulCarFeature).variant = featureState;
    (feature as StateFulCarFeature).setVariant = (newState) => {
      setFeatureState(newState);
    };
    return feature;
  }) as StateFulCarFeature[];
  const [activeTab, setActiveTab] = React.useState(statefulFeatures[0]);
  const [saveConfigDialogOpen, setSaveConfigDialogOpen] = useState(false);
  const [loadConfigDialogOpen, setLoadConfigDialogOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1); // remove '#'
    const params = new URLSearchParams(hash);
    for (let feature of statefulFeatures) {
      const hashValue = params.get(feature.name!);
      if (hashValue) feature.setVariant(hashValue);
    }
    const newTab = statefulFeatures.find(feature => feature.id === Number(params.get("tab")));
    if (newTab) setActiveTab(newTab);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    for (let feature of statefulFeatures) {
      if (feature.variant) params.set(feature.name!, feature.variant);
    }
    if (activeTab.id) params.set("tab", String(activeTab.id));
    window.location.hash = params.toString();
  }, [...statefulFeatures.map(feature => feature.variant), activeTab]);

  function saveConfiguration(name: string) {
    console.log('Saving configuration...');
    saveCar({
      name,
      features: statefulFeatures.map(feature => {
        return {
          feature: {
            id: feature.id
          },
          variant: feature.variant
        }
      })
    }).then(result => {
      console.log("Configuration saved successfully:", result);
      setSaveConfigDialogOpen(false);
      savedCars.push(result as SavedCar);
      setSavedCars(savedCars);
    });
  }

  const [savedCars, setSavedCars] = useState([] as SavedCar[]);
  useEffect(() => {
    getSavedCars().then(response => {
      setSavedCars(response as SavedCar[]);
    });
  }, []);

  function deleteConfiguration(savedCar: SavedCar) {
    deleteSavedCar(savedCar.id!).then(() => {
      setSavedCars(savedCars.filter(car => car.id !== savedCar.id));
    })
  }

  function loadConfiguration(savedCar: SavedCar) {
    console.log('Loading configuration:', savedCar);
    for (let feature of statefulFeatures) {
      const loadedFeature = savedCar.features!.find(element => element.feature!.id === feature.id);
      feature.setVariant(loadedFeature!.variant!);
    }
    setLoadConfigDialogOpen(false);
  }

  return (
    <>
      <div className={"flex flex-row gap-2 border-b-2 border-b-font-tertiary"}>
        {statefulFeatures.map((feature) => (
          <button
            key={feature.id}
            className={`${activeTab.id === feature.id ? "border-b-2" : ""} border-b-white`}
            onClick={() => setActiveTab(feature)}
          >
            {feature.name}
          </button>
        ))}
      </div>
      <CarScene color={statefulFeatures[0].variant} detailsColor={statefulFeatures[1].variant}
                glassColor={statefulFeatures[2].variant}/>
      <div className={"flex flex-row gap-2"}>
        {activeTab.variants!.map((variant) => (
          <ColorButton color={variant} onClick={() => activeTab.setVariant(variant)} key={variant}/>
        ))}
      </div>
      <div className={"flex-row flex gap-8"}>
        <Button onClick={() => setLoadConfigDialogOpen(true)}>Load Configuration</Button>
        <Button onClick={() => setSaveConfigDialogOpen(true)}>Save Configuration</Button>
        <SaveConfigurationDialog
          open={saveConfigDialogOpen}
          setOpen={setSaveConfigDialogOpen}
          saveConfigurationCallback={saveConfiguration}
        />
        <LoadConfigurationDialog open={loadConfigDialogOpen} setOpen={setLoadConfigDialogOpen}
                                 loadConfigurationCallback={loadConfiguration} savedCars={savedCars} deleteConfigurationCallback={deleteConfiguration}/>
      </div>
    </>
  );
}
