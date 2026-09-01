import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCw,
  Check,
  Move,
  Eye,
  Sparkles,
  Sliders,
  RefreshCw,
  Crop as CropIcon,
  CheckCheck,
  Maximize2,
  Lock,
  Unlock,
} from 'lucide-react';

interface BannerCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

interface AspectRatioOption {
  id: string;
  label: string;
  ratio: number | null; // width / height, null for freeform
  badge?: string;
}

interface CropBox {
  x: number; // percentage (0 to 100) or pixel in container
  y: number;
  width: number;
  height: number;
}

type DragHandle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null;

export const BannerCropperModal: React.FC<BannerCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  title = 'The Royal Eternity',
  subtitle = 'Signature Series',
  badgeText = 'Top Rated Studio',
}) => {
  const [selectedRatioId, setSelectedRatioId] = useState<string>('4:5');
  const [rotation, setRotation] = useState<number>(0);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Natural image dimensions
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);

  // Rendered image rect in canvas container
  const [imageRect, setImageRect] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Crop box in container coordinates (pixels relative to image container)
  const [cropBox, setCropBox] = useState<CropBox>({ x: 20, y: 20, width: 200, height: 250 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement>(null);

  // Dragging state
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const dragStartRef = useRef<{
    clientX: number;
    clientY: number;
    initialCropBox: CropBox;
  }>({
    clientX: 0,
    clientY: 0,
    initialCropBox: { x: 0, y: 0, width: 0, height: 0 },
  });

  const aspectRatios: AspectRatioOption[] = [
    { id: '4:5', label: '4:5 Dashboard', ratio: 4 / 5, badge: 'Frame Beranda' },
    { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
    { id: '1:1', label: '1:1 Persegi', ratio: 1 / 1 },
    { id: '16:9', label: '16:9 Luas', ratio: 16 / 9 },
    { id: 'free', label: 'Bebas / Manual', ratio: null, badge: 'Tarik Bebas' },
    {
      id: 'original',
      label: 'Rasio Asli',
      ratio: naturalDimensions ? naturalDimensions.width / naturalDimensions.height : 1,
    },
  ];

  const currentRatioOption = aspectRatios.find((r) => r.id === selectedRatioId) || aspectRatios[0];
  const targetRatio = currentRatioOption.ratio; // null if free

  // Calculate layout of image inside container when image is loaded or rotated
  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || !naturalDimensions) return;

    const containerRect = container.getBoundingClientRect();
    const isRotated90or270 = rotation % 180 !== 0;

    const nw = isRotated90or270 ? naturalDimensions.height : naturalDimensions.width;
    const nh = isRotated90or270 ? naturalDimensions.width : naturalDimensions.height;

    // Available space with padding
    const maxW = containerRect.width - 24;
    const maxH = containerRect.height - 24;

    if (maxW <= 0 || maxH <= 0) return;

    const scale = Math.min(maxW / nw, maxH / nh, 1);
    const renderedW = nw * scale;
    const renderedH = nh * scale;

    const posX = (containerRect.width - renderedW) / 2;
    const posY = (containerRect.height - renderedH) / 2;

    const newImageRect = {
      x: posX,
      y: posY,
      width: renderedW,
      height: renderedH,
    };
    setImageRect(newImageRect);

    // Position initial crop box nicely centered inside image
    let boxW = renderedW * 0.85;
    let boxH = renderedH * 0.85;

    if (targetRatio !== null) {
      if (boxW / boxH > targetRatio) {
        boxW = boxH * targetRatio;
      } else {
        boxH = boxW / targetRatio;
      }
    }

    // Ensure within bounds
    boxW = Math.min(boxW, renderedW);
    boxH = Math.min(boxH, renderedH);

    const boxX = posX + (renderedW - boxW) / 2;
    const boxY = posY + (renderedH - boxH) / 2;

    setCropBox({
      x: Math.round(boxX),
      y: Math.round(boxY),
      width: Math.round(boxW),
      height: Math.round(boxH),
    });
  }, [naturalDimensions, rotation, targetRatio]);

  // Handle image load
  const onImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setNaturalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  // When image dimensions change or window resizes, update layout
  useEffect(() => {
    updateLayout();
  }, [updateLayout]);

  useEffect(() => {
    const handleResize = () => updateLayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateLayout]);

  // Adjust crop box when aspect ratio selection changes
  useEffect(() => {
    if (!imageRect.width || !imageRect.height) return;

    setCropBox((prev) => {
      let newW = prev.width;
      let newH = prev.height;

      if (targetRatio !== null) {
        // Adapt height to match width and aspect ratio
        newH = newW / targetRatio;

        if (newH > imageRect.height) {
          newH = imageRect.height * 0.9;
          newW = newH * targetRatio;
        }
        if (newW > imageRect.width) {
          newW = imageRect.width * 0.9;
          newH = newW / targetRatio;
        }
      }

      // Clamp position within image bounds
      let newX = prev.x;
      let newY = prev.y;

      if (newX + newW > imageRect.x + imageRect.width) {
        newX = imageRect.x + imageRect.width - newW;
      }
      if (newY + newH > imageRect.y + imageRect.height) {
        newY = imageRect.y + imageRect.height - newH;
      }
      if (newX < imageRect.x) newX = imageRect.x;
      if (newY < imageRect.y) newY = imageRect.y;

      return {
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      };
    });
  }, [selectedRatioId, targetRatio, imageRect]);

  // Start dragging handles or box
  const startDrag = (handle: DragHandle, clientX: number, clientY: number) => {
    setActiveHandle(handle);
    dragStartRef.current = {
      clientX,
      clientY,
      initialCropBox: { ...cropBox },
    };
  };

  const handlePointerDown = (handle: DragHandle) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startDrag(handle, e.clientX, e.clientY);
  };

  // Perform drag calculation
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!activeHandle || !imageRect.width) return;

      const deltaX = e.clientX - dragStartRef.current.clientX;
      const deltaY = e.clientY - dragStartRef.current.clientY;
      const init = dragStartRef.current.initialCropBox;

      const minBoxSize = 40;
      const imgLeft = imageRect.x;
      const imgTop = imageRect.y;
      const imgRight = imageRect.x + imageRect.width;
      const imgBottom = imageRect.y + imageRect.height;

      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      if (activeHandle === 'move') {
        newX = Math.min(Math.max(init.x + deltaX, imgLeft), imgRight - newW);
        newY = Math.min(Math.max(init.y + deltaY, imgTop), imgBottom - newH);
      } else {
        // Resizing logic
        let left = init.x;
        let top = init.y;
        let right = init.x + init.width;
        let bottom = init.y + init.height;

        if (activeHandle.includes('e')) {
          right = Math.min(Math.max(init.x + init.width + deltaX, left + minBoxSize), imgRight);
        }
        if (activeHandle.includes('w')) {
          left = Math.max(Math.min(init.x + deltaX, right - minBoxSize), imgLeft);
        }
        if (activeHandle.includes('s')) {
          bottom = Math.min(Math.max(init.y + init.height + deltaY, top + minBoxSize), imgBottom);
        }
        if (activeHandle.includes('n')) {
          top = Math.max(Math.min(init.y + deltaY, bottom - minBoxSize), imgTop);
        }

        newW = right - left;
        newH = bottom - top;

        // Apply aspect ratio lock if active
        if (targetRatio !== null) {
          if (activeHandle === 'e' || activeHandle === 'w') {
            newH = newW / targetRatio;
            // center vertically relative to previous center
            const centerY = (top + bottom) / 2;
            top = centerY - newH / 2;
            bottom = centerY + newH / 2;
          } else if (activeHandle === 'n' || activeHandle === 's') {
            newW = newH * targetRatio;
            const centerX = (left + right) / 2;
            left = centerX - newW / 2;
            right = centerX + newW / 2;
          } else {
            // Diagonal corners (nw, ne, sw, se)
            if (newW / newH > targetRatio) {
              newW = newH * targetRatio;
            } else {
              newH = newW / targetRatio;
            }

            if (activeHandle === 'se') {
              right = left + newW;
              bottom = top + newH;
            } else if (activeHandle === 'sw') {
              left = right - newW;
              bottom = top + newH;
            } else if (activeHandle === 'ne') {
              right = left + newW;
              top = bottom - newH;
            } else if (activeHandle === 'nw') {
              left = right - newW;
              top = bottom - newH;
            }
          }

          // Bound check after aspect ratio correction
          if (left < imgLeft) {
            const diff = imgLeft - left;
            left = imgLeft;
            right += diff;
          }
          if (right > imgRight) {
            const diff = right - imgRight;
            right = imgRight;
            left -= diff;
          }
          if (top < imgTop) {
            const diff = imgTop - top;
            top = imgTop;
            bottom += diff;
          }
          if (bottom > imgBottom) {
            const diff = bottom - imgBottom;
            bottom = imgBottom;
            top -= diff;
          }

          left = Math.max(left, imgLeft);
          top = Math.max(top, imgTop);
          right = Math.min(right, imgRight);
          bottom = Math.min(bottom, imgBottom);

          newW = right - left;
          newH = bottom - top;
        }

        newX = left;
        newY = top;
      }

      setCropBox({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    },
    [activeHandle, imageRect, targetRatio]
  );

  const handlePointerUp = useCallback(() => {
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [activeHandle, handlePointerMove, handlePointerUp]);

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset to full view
  const handleReset = () => {
    setRotation(0);
    setSelectedRatioId('4:5');
    setTimeout(() => updateLayout(), 50);
  };

  // Maximize crop box to cover full image width/height
  const handleMaximizeCropBox = () => {
    if (!imageRect.width) return;
    setCropBox({
      x: imageRect.x,
      y: imageRect.y,
      width: imageRect.width,
      height: imageRect.height,
    });
    setSelectedRatioId('free');
  };

  // Calculate actual pixel size of cropped result
  const calculateOutputPixelSize = () => {
    if (!naturalDimensions || !imageRect.width) return { width: 0, height: 0 };
    const isRotated90or270 = rotation % 180 !== 0;
    const nw = isRotated90or270 ? naturalDimensions.height : naturalDimensions.width;
    const scale = nw / imageRect.width;

    return {
      width: Math.round(cropBox.width * scale),
      height: Math.round(cropBox.height * scale),
    };
  };

  const outputPixels = calculateOutputPixelSize();

  // Export full original photo directly without cropping
  const handleUseOriginalPhoto = async () => {
    if (!imageSrc || isProcessing) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const maxDimension = 960;
      let targetW = img.naturalWidth;
      let targetH = img.naturalHeight;

      if (targetW > maxDimension || targetH > maxDimension) {
        if (targetW > targetH) {
          targetH = Math.round((targetH * maxDimension) / targetW);
          targetW = maxDimension;
        } else {
          targetW = Math.round((targetW * maxDimension) / targetH);
          targetH = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

      onCropComplete(dataUrl);
      onClose();
    } catch (err) {
      console.error('Error exporting original image:', err);
      onCropComplete(imageSrc);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply manual crop selection from visual bounding box
  const handleApplyCrop = async () => {
    if (!imageSrc || !naturalDimensions || isProcessing) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Calculate source coordinates relative to rotated canvas or natural image
      const isRotated90or270 = rotation % 180 !== 0;
      const naturalW = isRotated90or270 ? naturalDimensions.height : naturalDimensions.width;
      const naturalH = isRotated90or270 ? naturalDimensions.width : naturalDimensions.height;

      // Scale factor between rendered image on screen and natural dimensions
      const scaleX = naturalW / imageRect.width;
      const scaleY = naturalH / imageRect.height;

      // Exact pixel coordinates on natural scaled image
      const sourceX = Math.max(0, (cropBox.x - imageRect.x) * scaleX);
      const sourceY = Math.max(0, (cropBox.y - imageRect.y) * scaleY);
      const sourceW = Math.min(naturalW - sourceX, cropBox.width * scaleX);
      const sourceH = Math.min(naturalH - sourceY, cropBox.height * scaleY);

      // Intermediate canvas for rotated natural image if rotation is active
      const rotatedCanvas = document.createElement('canvas');
      rotatedCanvas.width = naturalW;
      rotatedCanvas.height = naturalH;
      const rCtx = rotatedCanvas.getContext('2d');

      if (!rCtx) throw new Error('Cannot create rotation context');

      rCtx.save();
      rCtx.translate(naturalW / 2, naturalH / 2);
      rCtx.rotate((rotation * Math.PI) / 180);
      rCtx.drawImage(
        img,
        -naturalDimensions.width / 2,
        -naturalDimensions.height / 2,
        naturalDimensions.width,
        naturalDimensions.height
      );
      rCtx.restore();

      // Final output crop canvas (sharp web banner quality, max 960px width/height)
      const maxOutW = 960;
      let finalOutW = sourceW;
      let finalOutH = sourceH;

      if (finalOutW > maxOutW || finalOutH > maxOutW) {
        if (finalOutW >= finalOutH) {
          finalOutH = Math.round((finalOutH * maxOutW) / finalOutW);
          finalOutW = maxOutW;
        } else {
          finalOutW = Math.round((finalOutW * maxOutW) / finalOutH);
          finalOutH = maxOutW;
        }
      }

      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = Math.max(1, Math.round(finalOutW));
      outputCanvas.height = Math.max(1, Math.round(finalOutH));
      const oCtx = outputCanvas.getContext('2d');

      if (!oCtx) throw new Error('Cannot create output context');

      oCtx.fillStyle = '#0A0A0A';
      oCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

      // Draw cropped slice
      oCtx.drawImage(
        rotatedCanvas,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
      );

      const croppedBase64 = outputCanvas.toDataURL('image/jpeg', 0.82);
      onCropComplete(croppedBase64);
      onClose();
    } catch (err) {
      console.error('Error applying manual crop:', err);
      alert('Terjadi kesalahan saat memotong gambar.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#121212] border border-[#D4AF37]/50 w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Atur & Crop Foto Banner Manual
                </h3>
                {outputPixels.width > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-semibold">
                    Hasil Crop: {outputPixels.width} × {outputPixels.height} px
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-sans mt-0.5">
                Tarik kotak kuning atau titik sudut untuk mengatur area potong secara manual sesuai keinginan Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Workspace Layout */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Center Stage: Interactive Manual Canvas */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            
            {/* Visual Canvas Container */}
            <div
              ref={containerRef}
              className="w-full h-[360px] sm:h-[440px] bg-[#0A0A0A] border border-white/15 relative overflow-hidden flex items-center justify-center shadow-inner"
            >
              {/* Full Image in background */}
              {imageSrc && (
                <img
                  ref={imageElementRef}
                  src={imageSrc}
                  alt="Crop Source"
                  onLoad={onImageLoaded}
                  className="pointer-events-none select-none transition-transform duration-75"
                  style={{
                    position: 'absolute',
                    left: `${imageRect.x}px`,
                    top: `${imageRect.y}px`,
                    width: `${imageRect.width}px`,
                    height: `${imageRect.height}px`,
                    transform: `rotate(${rotation}deg)`,
                    objectFit: 'contain',
                  }}
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Shaded Backdrop / Mask outside crop box (4 panels for crisp highlight) */}
              {imageRect.width > 0 && (
                <>
                  {/* Top shaded bar */}
                  <div
                    className="absolute bg-black/75 pointer-events-none transition-all duration-75"
                    style={{
                      left: 0,
                      top: 0,
                      right: 0,
                      height: `${Math.max(0, cropBox.y)}px`,
                    }}
                  />
                  {/* Bottom shaded bar */}
                  <div
                    className="absolute bg-black/75 pointer-events-none transition-all duration-75"
                    style={{
                      left: 0,
                      top: `${cropBox.y + cropBox.height}px`,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  {/* Left shaded bar */}
                  <div
                    className="absolute bg-black/75 pointer-events-none transition-all duration-75"
                    style={{
                      left: 0,
                      top: `${cropBox.y}px`,
                      width: `${Math.max(0, cropBox.x)}px`,
                      height: `${cropBox.height}px`,
                    }}
                  />
                  {/* Right shaded bar */}
                  <div
                    className="absolute bg-black/75 pointer-events-none transition-all duration-75"
                    style={{
                      left: `${cropBox.x + cropBox.width}px`,
                      top: `${cropBox.y}px`,
                      right: 0,
                      height: `${cropBox.height}px`,
                    }}
                  />
                </>
              )}

              {/* Interactive Bounding Crop Box */}
              {imageRect.width > 0 && (
                <div
                  onPointerDown={handlePointerDown('move')}
                  className="absolute border-2 border-[#D4AF37] cursor-move shadow-2xl z-20 transition-all duration-75 group"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                  }}
                >
                  {/* Rule of Thirds Guides */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                    <div className="border-r border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div className="border-r border-b border-white/15" />
                    <div />
                  </div>

                  {/* Corner Handles (NW, NE, SW, SE) */}
                  <div
                    onPointerDown={handlePointerDown('nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-[#D4AF37] border-2 border-black cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-30"
                  />
                  <div
                    onPointerDown={handlePointerDown('ne')}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-[#D4AF37] border-2 border-black cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-30"
                  />
                  <div
                    onPointerDown={handlePointerDown('sw')}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#D4AF37] border-2 border-black cursor-nesw-resize shadow-md hover:scale-125 transition-transform z-30"
                  />
                  <div
                    onPointerDown={handlePointerDown('se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#D4AF37] border-2 border-black cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-30"
                  />

                  {/* Edge Handles (N, S, E, W) */}
                  <div
                    onPointerDown={handlePointerDown('n')}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#D4AF37] border border-black cursor-ns-resize hover:scale-110 transition-transform z-30"
                  />
                  <div
                    onPointerDown={handlePointerDown('s')}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#D4AF37] border border-black cursor-ns-resize hover:scale-110 transition-transform z-30"
                  />
                  <div
                    onPointerDown={handlePointerDown('w')}
                    className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-6 bg-[#D4AF37] border border-black cursor-ew-resize hover:scale-110 transition-transform z-30"
                  />
                  <div
                    onPointerDown={handlePointerDown('e')}
                    className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-6 bg-[#D4AF37] border border-black cursor-ew-resize hover:scale-110 transition-transform z-30"
                  />

                  {/* Live Simulation Overlay in Dashboard */}
                  {showLivePreview && (
                    <>
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#0A0A0A]/85 backdrop-blur-sm border border-white/20 text-[8px] uppercase tracking-widest text-[#D4AF37] pointer-events-none flex items-center gap-1 shadow-md">
                        <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                        <span>{badgeText}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 p-2 bg-[#0F0F0F]/85 backdrop-blur-sm border border-white/15 text-[#E0E0E0] pointer-events-none shadow-xl">
                        <span className="text-[8px] font-bold tracking-wider text-[#D4AF37] uppercase block">{subtitle}</span>
                        <h5 className="font-serif font-semibold text-[10px] sm:text-[11px] text-white truncate leading-tight">{title}</h5>
                      </div>
                    </>
                  )}

                  {/* Center Drag Helper Indicator */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/80 text-[9px] font-mono text-gray-200 pointer-events-none flex items-center gap-1 border border-white/15 shadow">
                    <Move className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span>Geser Kotak</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Canvas Toolbar below */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleMaximizeCropBox}
                className="px-2.5 py-1 text-xs font-mono bg-black/50 hover:bg-black border border-white/15 text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Perluas kotak crop ke ukuran maksimal foto"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Pilih Seluruh Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`px-2.5 py-1 text-xs font-mono border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  showLivePreview
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#D4AF37]'
                    : 'bg-black/40 border-white/15 text-gray-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Simulasi Teks: {showLivePreview ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1 text-xs font-mono bg-black/50 hover:bg-black border border-white/15 text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Putar 90° ({rotation}°)</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-mono bg-black/50 hover:bg-black border border-white/15 text-gray-400 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Reset posisi crop ke default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

          </div>

          {/* Right Column: Ratio Presets & Controls */}
          <div className="lg:col-span-4 space-y-4 bg-[#171717] p-4 sm:p-5 border border-white/10">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-gray-300 font-bold block">
                  Kunci Rasio / Preset:
                </label>
                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                  {targetRatio === null ? <Unlock className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-[#D4AF37]" />}
                  <span>{targetRatio === null ? 'Tarik Bebas' : 'Rasio Terkunci'}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((opt) => {
                  const isSelected = selectedRatioId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedRatioId(opt.id)}
                      className={`p-2.5 text-left border font-mono text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37] text-black font-bold border-[#D4AF37] shadow-sm'
                          : 'bg-[#0A0A0A] text-gray-300 hover:text-white border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="truncate font-semibold">{opt.label}</div>
                      {opt.badge && (
                        <span className={`text-[9px] block mt-0.5 ${isSelected ? 'text-black/80 font-bold' : 'text-[#D4AF37]'}`}>
                          ★ {opt.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="p-3 bg-black/60 border border-[#D4AF37]/30 space-y-2 text-xs text-gray-300">
              <div className="text-[#D4AF37] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Cara Mengatur Crop Manual:</span>
              </div>
              <ul className="text-[11px] text-gray-400 space-y-1 list-disc list-inside">
                <li><strong className="text-white">Tarik titik sudut kuning</strong> untuk memperbesar / memperkecil area potong.</li>
                <li><strong className="text-white">Geser di dalam kotak</strong> untuk memindahkan fokus ke wajah atau objek foto.</li>
                <li>Pilih <strong className="text-white">Bebas / Manual</strong> jika ingin menarik sisi panjang & lebar secara mandiri.</li>
              </ul>
            </div>

            {/* Direct Original Option */}
            <div className="p-3 bg-[#111111] border border-white/10 space-y-1 text-xs text-gray-400">
              <span className="text-gray-200 font-semibold block text-[11px]">Tidak ingin memotong foto?</span>
              <p className="text-[11px]">
                Gunakan tombol <strong className="text-gray-300">"Gunakan Foto Asli"</strong> di bawah untuk menyimpan seluruh foto tanpa dipotong.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 flex flex-wrap items-center justify-between bg-[#181818] gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 bg-black/60 hover:bg-black text-gray-300 hover:text-white border border-white/15 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            {/* Use Original As-Is */}
            <button
              type="button"
              onClick={handleUseOriginalPhoto}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-200 hover:text-white border border-white/20 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simpan foto asli secara utuh tanpa memotong bagian apapun"
            >
              <CheckCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Gunakan Foto Asli</span>
            </button>

            {/* Apply Manual Cropping */}
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isProcessing}
              className={`px-5 py-2.5 font-bold text-xs uppercase tracking-[0.12em] flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                isProcessing
                  ? 'bg-amber-600/50 text-black cursor-not-allowed'
                  : 'bg-[#D4AF37] hover:bg-white text-black'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isProcessing ? 'Memproses...' : 'Terapkan Hasil Crop Manual'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
