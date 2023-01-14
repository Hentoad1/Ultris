import {Children, Fragment, cloneElement, useRef, useEffect, useState, useCallback} from 'react';

import './scrollbar.css';

function Scrollbar(props){
  let ref = useRef({});
  let [top, setTop] = useState(null);
  let [height, setHeight] = useState(null);
  let [display, setDisplay] = useState(true);

  let updateScrollbarPosition = useCallback((deltaY) => {
    let elem = ref.current;
    
    let clientHeight = elem.clientHeight; //visable height of the main element
    let scrollHeight = elem.scrollHeight; //amount the element has been scrolled
    let scrollTop = elem.scrollTop; //amount the element can be scrolled

    scrollTop = scrollTop + deltaY;

    elem.scroll(0, scrollTop);


    let percentageScrolled = (scrollTop) / (scrollHeight - clientHeight);
    percentageScrolled = Math.max(0, percentageScrolled);
    percentageScrolled = Math.min(1, percentageScrolled);


    let thumbTop = percentageScrolled * (clientHeight - height);

    setTop(thumbTop);
  },[setTop, height]);

  let updateScrollbarSize = useCallback(() => {
    let elem = ref.current;

    let clientHeight = elem.clientHeight; //visable height of the main element
    let scrollHeight = elem.scrollHeight; //amount the element has been scrolled

    let hasOverflow = clientHeight >= scrollHeight;
    setDisplay(!hasOverflow);

    let percentageOfPageVisible = (clientHeight / scrollHeight);
    let thumbHeight = percentageOfPageVisible * clientHeight;

    console.log(thumbHeight);

    setHeight(thumbHeight);

    updateScrollbarPosition(0);
  }, [setDisplay, updateScrollbarPosition])

  //connect to scroll wheel
  useEffect(() => {
    let eventHandler = (event) => {
      updateScrollbarPosition(event.deltaY);
    }

    let elem = ref.current;

    elem.addEventListener('wheel', eventHandler);

    return () => {
      elem.removeEventListener('wheel', eventHandler);
    }
  }, [updateScrollbarPosition])

  //observe size change
  useEffect(() => {
    let resizeObserver = new ResizeObserver(updateScrollbarSize);
    let mutationObserver = new MutationObserver(updateScrollbarSize);

    let target = ref.current;

    resizeObserver.observe(target);

    mutationObserver.observe(target, {
      childList: true,
      subtree: true,
    });


    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    }
  }, [updateScrollbarSize])
  
  //scroll page with mouse
  let HandleMouseDown = useCallback((event) => {
    event.preventDefault(); //disables text selection

    let mouseY = event.clientY;

    let HandleMouseMove = (event) => {  
      let elem = ref.current;
      
      let clientHeight = elem.clientHeight; //visable height of the main element
      let scrollHeight = elem.scrollHeight; //amount the element has been scrolled

      let deltaY = event.clientY - mouseY;

      let thumbTop = top + deltaY;
      let percentageScrolled = thumbTop / (clientHeight - height);
      thumbTop = Math.max(0, thumbTop);
      thumbTop = Math.min(clientHeight - height, thumbTop);

      let scrollTop = scrollHeight * percentageScrolled;

      elem.scroll(0, scrollTop);

      setTop(thumbTop);
    }

    let HandleMouseUp = () => {
      window.removeEventListener('mouseup', HandleMouseUp);
      window.removeEventListener('mousemove', HandleMouseMove);
    }

    window.addEventListener('mouseup', HandleMouseUp);
    window.addEventListener('mousemove', HandleMouseMove);
  }, [top, height, setTop]);

  let child = Children.only(props.children);
  return (
    <Fragment>
      {cloneElement(child, {...child.props, style:{"overflow":"hidden"},ref})}
      <div className = 'scrollbar_track' style = {{top:ref.current?.getBoundingClientRect?.()?.y ?? null,display:display ? null : 'none'}}>
        <div className = 'scrollbar_thumb_outer' style = {{top,height}} onMouseDown = {HandleMouseDown}>
          <div className = 'scrollbar_thumb_inner'></div>
        </div>
      </div>
    </Fragment>
  )
}

export default Scrollbar;