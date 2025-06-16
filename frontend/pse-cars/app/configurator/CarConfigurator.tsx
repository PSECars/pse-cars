"use client";
import CarScene from "@/app/configurator/CarScene";
import ColorButton from "@/app/configurator/ColorButton";
import Button from "@/app/components/Button";
import React, {useEffect, useState} from "react";
import {CarFeature} from "@/app/http-client/openapi";

function parseHash(features: StateFulCarFeature[]) {
  const hash = window.location.hash.slice(1); // remove '#'
  const params = new URLSearchParams(hash);
  for (let feature of features) {
    const hashValue = params.get(feature.name!);
    if (hashValue) feature.setVariant(hashValue);
  }
  return {
    activeTabId: Number(params.get("tab"))
  };
}

function updateHash(features: StateFulCarFeature[], activeTabId?: number) {
  const params = new URLSearchParams();
  for (let feature of features) {
    if (feature.variant) params.set(feature.name!, feature.variant);
  }
  if (activeTabId) params.set("tab", String(activeTabId));
  window.location.hash = params.toString();
}

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
    (feature as StateFulCarFeature).setVariant = setFeatureState;
    return feature;
  }) as StateFulCarFeature[];
  const [activeTab, setActiveTab] = React.useState(statefulFeatures[0]);

  useEffect(() => {
    const { activeTabId } = parseHash(statefulFeatures);
    const newTab = statefulFeatures.find(feature => feature.id === activeTabId);
    if (newTab) setActiveTab(newTab);
  }, []);

  // TODO: fix that hash is set to default values on first render

  useEffect(() => {
    updateHash(statefulFeatures, activeTab.id);
  }, [...statefulFeatures.map(feature => feature.variant), activeTab]);


  useEffect(() => {
    const onHashChange = () => {
      const { activeTabId } = parseHash(statefulFeatures);
      const newTab = statefulFeatures.find(feature => feature.id === activeTabId);
      if (newTab) setActiveTab(newTab);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const saveConfiguration = () => {
    // openApiClient!.saveCar({}, {
    //   features: [{
    //     feature: {
    //       id: 0,
    //     },
    //     variant: color
    //   }, {
    //     feature: {
    //       id: 1,
    //     },
    //     variant: detailsColor
    //   }, {
    //     feature: {
    //       id: 2,
    //     },
    //     variant: glassColor
    //   }]
    // })
    //   .then(result => {
    //     console.log("Configuration saved successfully:", result);
    //   })
  };
  return (
    <>
      <div className={"flex flex-row gap-2 border-b-2 border-b-font-tertiary"}>
        { statefulFeatures.map((feature) => (
          <button
            key={feature.id}
            className={`${activeTab.id === feature.id ? "border-b-2": ""} border-b-white`}
            onClick={() => setActiveTab(feature)}
          >
            {feature.name}
          </button>
        ))}
      </div>
      <CarScene color={statefulFeatures[0].variant} detailsColor={statefulFeatures[1].variant} glassColor={statefulFeatures[2].variant} />
      <div className={"flex flex-row gap-2"}>
        { activeTab.variants!.map((variant) => (
          <ColorButton color={variant} onClick={() => activeTab.setVariant(variant)} key={variant}/>
        ))}
      </div>
      <div className={"flex-row flex gap-8"}>
        <Button>Share with Dealer</Button>
        <Button onClick={saveConfiguration}>Save Configuration</Button>
      </div>
    </>
  );
}
