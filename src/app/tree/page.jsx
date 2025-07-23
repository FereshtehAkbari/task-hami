"use client";

import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { rgbToHex } from "@mui/material";
import { toast } from "react-toastify";

const dataOfTree = [
  {
    id: "1",
    label: "دارایی های جاری",
    children: [
      {
        id: "01",
        label: "وجوه نقد",
        children: [
          { id: "011", label: "تن خواه", children: [] },
          { id: "012", label: "بانک", children: [] },
        ],
      },
      {
        id: "02",
        label: "حساب  های دریافتی",
        children: [
          { id: "021", label: "جساب های دریافتی حامی کت", children: [] },
        ],
      },
    ],
  },
  { id: "2", label: "دارایی های غیر جاری", children: [] },
  { id: "3", label: "بدهی های جاری", children: [] },
  { id: "4", label: "بدهی های غیر جاری", children: [] },
  { id: "5", label: "حقوق صاحبان سهام(سرمایه)", children: [] },
  { id: "6", label: "درآمد", children: [] },
  { id: "7", label: "قیمت تمام شده", children: [] },
  { id: "8", label: "هزینه ها", children: [] },
  { id: "9", label: "حساب های انتظامی", children: [] },
];

function TreePage() {
  const [treeData, setTreeData] = useState(dataOfTree);
  const [expandedIds, setExpandedIds] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [clipboardAction, setClipboardAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState("");

  const handleContextMenu = (e, nodeId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItem(nodeId);
    setContextMenu(e.currentTarget);
  };

  const closeMenu = () => {
    setContextMenu(null);
  };

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const removeNodeById = (nodes, id) => {
    return nodes
      .map((node) => {
        if (node.id === id) return null;
        if (node.children) node.children = removeNodeById(node.children, id);
        return node;
      })
      .filter(Boolean);
  };

  function canCut() {
    const node = findNodeById(treeData, selectedItem);
    return node && node.children.length === 0;
  }

  function canDelete() {
    const node = findNodeById(treeData, selectedItem);
    return node && node.children.length === 0;
  }

  const addChildNode = (nodes, parentId, label) => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        const newNode = {
          id: Date.now().toString(),
          label,
          children: [],
        };
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      } else if (node.children) {
        return {
          ...node,
          children: addChildNode(node.children, parentId, label),
        };
      }
      return node;
    });
  };

  const handleCut = () => {
    const node = findNodeById(treeData, selectedItem);
    if (!node) return toast.error("آیتم یافت نشد");
    if (node.children.length > 0) {
      toast.error("نود دارای زیرشاخه است و نمی‌توان برش داد.");
      closeMenu();
      return;
    }
    setClipboard(node);
    setClipboardAction("cut");
    setTreeData(removeNodeById(treeData, selectedItem));
    closeMenu();
    setSelectedItem(null);
  };

  const handleCopy = () => {
    const node = findNodeById(treeData, selectedItem);
    if (!node) return toast.error("آیتم یافت نشد");

    const { children, ...shallowCopy } = node;
    setClipboard(shallowCopy);
    setClipboardAction("copy");
    closeMenu();
  };

  const handlePaste = () => {
    if (!clipboard) {
      toast.error("چیزی برای چسباندن وجود ندارد.");
      closeMenu();
      return;
    }
    setTreeData((prev) => {
      let newTree = JSON.parse(JSON.stringify(prev));
      if (clipboardAction === "cut") {
        const addCutNode = (nodes, parentId, nodeToAdd) => {
          return nodes.map((node) => {
            if (node.id === parentId) {
              node.children = [...(node.children || []), nodeToAdd];
            } else if (node.children) {
              node.children = addCutNode(node.children, parentId, nodeToAdd);
            }
            return node;
          });
        };
        newTree = addCutNode(newTree, selectedItem, clipboard);
        setClipboard(null);
        setClipboardAction(null);
      } else if (clipboardAction === "copy") {
        const newNode = JSON.parse(JSON.stringify(clipboard));
        newNode.id = Date.now().toString();

        const addCopiedNode = (nodes, parentId, nodeToAdd) => {
          return nodes.map((node) => {
            if (node.id === parentId) {
              node.children = [...(node.children || []), nodeToAdd];
            } else if (node.children) {
              node.children = addCopiedNode(node.children, parentId, nodeToAdd);
            }
            return node;
          });
        };
        newTree = addCopiedNode(newTree, selectedItem, newNode);
      }
      return newTree;
    });
    closeMenu();
  };

  const handleDelete = () => {
    const node = findNodeById(treeData, selectedItem);
    if (!node) return toast.error("آیتم یافت نشد");
    if (node.children.length > 0) {
      toast.error("نود دارای زیرشاخه است و نمی‌توان حذف کرد.");
      closeMenu();
      return;
    }
    setTreeData(removeNodeById(treeData, selectedItem));
    toast.success("زیر شاخه با موفقیت حذف شد");
    closeMenu();
    setSelectedItem(null);
  };

  const handleAddChild = () => {
    setNewNodeLabel("");
    setModalOpen(true);
    closeMenu();
  };

  const handleSaveNewChild = () => {
    if (!newNodeLabel.trim()) {
      toast.error("لطفا نام را وارد کنید");
      return;
    }
    setTreeData((prev) =>
      addChildNode(prev, selectedItem, newNodeLabel.trim())
    );
    setExpandedIds((prev) => [...new Set([...prev, selectedItem])]);
    toast.success("زیر شاخه با موفقیت افزوده شد");
    setModalOpen(false);
    setSelectedItem(null);
    setContextMenu(null);
  };

  const renderTree = (nodes) =>
    nodes.map((node) => (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={node.label}
        onContextMenu={(e) => handleContextMenu(e, node.id)}
        sx={{
          bgcolor:
            selectedItem === node.id
              ? "rgba(100, 6, 151, 0.15)"
              : "transparent",
          "&:hover": {
            bgcolor: "rgba(161, 25, 210, 0.08)",
            cursor: "pointer",
          },
          borderRadius: 1,
        }}
      >
        {node.children && node.children.length > 0
          ? renderTree(node.children)
          : null}
      </TreeItem>
    ));

  return (
    <div style={{ maxWidth: 600, margin: "20px auto", padding: "0 10px" }}>
      <h2>حساب های اصلی</h2>
      <SimpleTreeView expanded={expandedIds}>
        {renderTree(treeData)}
      </SimpleTreeView>

      <Menu
        anchorEl={contextMenu}
        open={Boolean(contextMenu)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            bgcolor: "#f9f9f9",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: 2,
            minWidth: 150,
          },
        }}
      >
        <MenuItem onClick={handleCut} disabled={!selectedItem || !canCut()}>
          برش
        </MenuItem>
        <MenuItem onClick={handleCopy} disabled={!selectedItem}>
          کپی
        </MenuItem>
        <MenuItem onClick={handlePaste} disabled={!clipboard || !selectedItem}>
          چسباندن
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          disabled={!selectedItem || !canDelete()}
        >
          حذف
        </MenuItem>
        <MenuItem onClick={handleAddChild} disabled={!selectedItem}>
          افزودن زیرشاخه
        </MenuItem>
      </Menu>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            p: 3,
            width: 350,
          }}
        >
          <TextField
            fullWidth
            label="نام زیرشاخه جدید"
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: "rgb(133, 62, 172)",
            }}
            fullWidth
            onClick={handleSaveNewChild}
          >
            افزودن
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default TreePage;
