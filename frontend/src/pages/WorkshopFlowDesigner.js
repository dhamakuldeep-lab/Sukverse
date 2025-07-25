import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

import "./WorkshopFlowDesigner.css"; // we will add styling later

// Sidebar Items
const nodeTypes = [
  { type: "section", label: "Section" },
  { type: "concept", label: "Concept Explanation" },
  { type: "code", label: "Code Editor" },
  { type: "quiz", label: "Quiz" },
  { type: "certificate", label: "Certificate" },
];

export default function WorkshopFlowDesigner() {
  const initialNodes = [
    {
      id: "start",
      position: { x: 250, y: 0 },
      data: { label: "Start Workshop" },
      type: "input",
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = {
        x: event.clientX - 250,
        y: event.clientY - 50,
      };

      const newNode = {
        id: `${type}-${+new Date()}`,
        position,
        data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="flow-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3>Drag Nodes</h3>
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            className="sidebar-item"
            onDragStart={(event) => onDragStart(event, node.type)}
            draggable
          >
            {node.label}
          </div>
        ))}
      </aside>

      {/* Main Canvas */}
      <div className="flow-canvas" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
