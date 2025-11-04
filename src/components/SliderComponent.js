import { useEffect, useRef, useMemo } from "react";
import React from "react";

const getActiveIndex = (children) => {
  let index = -1;
  React.Children.forEach(children, (child, i) => {
    if (React.isValidElement(child) && child.props.isActive === true) {
      index = i;
    }
  });
  return index;
};

export default function SliderComponent(props) {
  const { children } = props;
  const sliderRef = useRef({});
  const itemRefs = useRef([]);

  // React.Children ile children'ı iterate et ve isActive olanı bul
  const activeIndex = getActiveIndex(children);

  // Scroll'u activeIndex'e kaydır

  useEffect(() => {
    const swipe = () => {
      const container = sliderRef.current;
      if (!container) return;

      // Her frame'de güncel children'dan activeIndex al
      const acIndex = getActiveIndex(children);
      console.log("activeIndex", acIndex);
      const activeItem = itemRefs.current[acIndex];
      if (!activeItem || acIndex < 0) return;

      const containerRect = container.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      const itemOffsetLeft = itemRect.left - containerRect.left;

      if (itemOffsetLeft === 0) {
        console.log("itemOffsetLeft === 0");
        return;
      }

      container.scrollLeft = container.scrollLeft + itemOffsetLeft;

      if (
        container.scrollLeft >=
        container.scrollWidth - container.offsetWidth
      ) {
        console.log(
          "container.scrollLeft >= container.scrollWidth - container.offsetWidth"
        );
        return;
      }
      if (container.scrollLeft <= 0) {
        console.log("container.scrollLeft <= 0");
        return;
      }

      sliderRef.current.requestAnimationFrameInstance =
        requestAnimationFrame(swipe);
    };
    sliderRef.current.requestAnimationFrameInstance =
      requestAnimationFrame(swipe);
    return () => {
      if (sliderRef.current) {
        cancelAnimationFrame(sliderRef.current.requestAnimationFrameInstance);
      }
    };
  }, [children]); // children değiştiğinde swipe yeniden oluşturulsun

  const handleMouseDownCapture = () => {
    console.log("handleMouseDownCapture");
  };

  console.log("-----activeIndex-----", activeIndex);

  return (
    <div
      ref={sliderRef}
      className="sections-list"
      onMouseDownCapture={handleMouseDownCapture}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          className="slider-item-wrapper"
        >
          {child}
        </div>
      ))}
    </div>
  );
}
