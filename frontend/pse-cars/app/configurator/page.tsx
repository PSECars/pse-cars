'use client'

import CarScene from "@/app/components/CarScene";
import Button from "@/app/components/Button";
import ColorButton from "@/app/components/ColorButton";
import React, {useEffect} from "react";

// const colors = [
//   "#0E0E0E",
//   "#BA0E1B",
//   "#1042B5",
//   "#016C5C",
//   "#557C01",
//   "#A25201"
// ];
//
// const detailColors = [
//   "#FFFFFF",
// ]
//
// const glassColors = [
//   "#FFFFFF",
// ]


function parseHash() {
  const hash = window.location.hash.slice(1); // remove '#'
  const params = new URLSearchParams(hash);
  return {
    color: params.get("color"),
    detailsColor: params.get("details"),
    glassColor: params.get("glass"),
    activeTabId: Number(params.get("tab")),
  };
}

function updateHash({ color, detailsColor, glassColor, activeTabId }) {
  const params = new URLSearchParams();
  if (color) params.set("color", color);
  if (detailsColor) params.set("details", detailsColor);
  if (glassColor) params.set("glass", glassColor);
  if (activeTabId) params.set("tab", activeTabId);
  window.location.hash = params.toString();
}

const tabs = [
  {
    id: 0,
    name: "Color",
    options: ["#0E0E0E", "#BA0E1B", "#1042B5", "#016C5C", "#557C01", "#A25201"],
    setOptionFn: (option) => {}
  },
  {
    id: 1,
    name: "Rims",
    options: ["#FFFFFF", "#000000"],
    setOptionFn: (option) => {}
  },
  {
    id: 2,
    name: "Glass",
    options: ["#FFFFFF", "#000000", "#5c391d"],
    setOptionFn: (option) => {}
  },
]

export default function ConfiguratorPage() {

  const initial = parseHash();

  const [color, setColor] = React.useState(initial.color || tabs[0].options[0]);
  const [detailsColor, setDetailsColor] = React.useState(initial.detailsColor || tabs[1].options[0]);
  const [glassColor, setGlassColor] = React.useState(initial.glassColor || tabs[2].options[0]);
  const [activeTab, setActiveTab] = React.useState(tabs[initial.activeTabId || 0]);
  tabs[0].setOptionFn = setColor;
  tabs[1].setOptionFn = setDetailsColor;
  tabs[2].setOptionFn = setGlassColor;

  useEffect(() => {
    updateHash({color, detailsColor, glassColor, activeTabId: activeTab.id});
  }, [color, detailsColor, glassColor, activeTab]);


  useEffect(() => {
    const onHashChange = () => {
      const updated = parseHash();
      if (updated.color) setColor(updated.color);
      if (updated.detailsColor) setDetailsColor(updated.detailsColor);
      if (updated.glassColor) setGlassColor(updated.glassColor);
      const newTab = tabs.find(t => t.id === updated.activeTabId);
      if (newTab) setActiveTab(newTab);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);


  return (
    <div className="overflow-x-hidden overflow-y-hidden">
      <main className="flex flex-col items-center px-10 max-w-400 mx-auto bg-surface-primary">
        <section className="flex flex-col items-center justify-center w-full h-screen z-10 gap-5">
          <div className={"flex flex-row gap-2 border-b-2 border-b-font-tertiary"}>
            { tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${activeTab.id === tab.id ? "border-b-2": ""} border-b-white`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <CarScene color={color} detailsColor={detailsColor} glassColor={glassColor} />
          <div className={"flex flex-row gap-2"}>
            { activeTab.options.map((option) => (
              <ColorButton color={option} onClick={() => activeTab.setOptionFn(option)} key={option}/>
            ))}
          </div>
          <div className={"flex-row flex gap-8"}>
            <Button>Share with Dealer</Button>
            <Button>Save Configuration</Button>
          </div>
        </section>
      </main>
    </div>
  )
}
