import {Children, Fragment, cloneElement, useRef, useEffect, useState, useCallback} from 'react';

import './scrollbar.css';

function Scrollbar(props){
  let ref = useRef({});
  let [top, setTop] = useState(null);
  let [height, setHeight] = useState(null);
  let [display, setDisplay] = useState(true);
  let [mouseHeld, mouseRelased] = useState(false);


  let updateScrollbarPosition = useCallback((DeltaY) => {
    let elem = ref.current;
    
    let clientHeight = elem.clientHeight; //visable height of the main element
    let scrollHeight = elem.scrollHeight; //amount the element has been scrolled
    let scrollTop = elem.scrollTop; //amount the element can be scrolled

    //scroll page manually

    scrollTop = scrollTop + DeltaY;
    
    console.log(scrollTop);

    elem.scroll(0, scrollTop);


    let percentageScrolled = (scrollTop) / (scrollHeight - clientHeight);
    percentageScrolled = Math.max(0, percentageScrolled);
    percentageScrolled = Math.min(1, percentageScrolled);


    let thumbTop = percentageScrolled * (clientHeight - height);

    setTop(thumbTop);
  },[ref, setTop, height]);

  let updateScrollbarSize = useCallback(() => {
    let elem = ref.current;

    let clientHeight = elem.clientHeight; //visable height of the main element
    let scrollHeight = elem.scrollHeight; //amount the element has been scrolled

    let hasOverflow = clientHeight >= scrollHeight;
    setDisplay(!hasOverflow);

    let percentageOfPageVisible = (clientHeight / scrollHeight);
    let thumbHeight = percentageOfPageVisible * clientHeight;

    setHeight(thumbHeight);

    updateScrollbarPosition(0);
  }, [ref, setDisplay, updateScrollbarPosition])

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
  }, [ref, updateScrollbarPosition])

  //observe size change
  useEffect(() => {
    let observer = new ResizeObserver(updateScrollbarSize)

    if (ref.current){
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    }
  }, [updateScrollbarSize])
  

  let child = Children.only(props.children);
  return (
    <Fragment>
      {cloneElement(child, {...child.props, ref})}
      <div className = 'scrollbar_track' style = {{top:ref.current?.getBoundingClientRect?.()?.y ?? null,display:display ? null : 'none'}}>
        <div className = 'scrollbar_thumb_outer' style = {{top,height}}>
          <div className = 'scrollbar_thumb_inner'></div>
        </div>
      </div>
    </Fragment>
  )
}

  console.log(Scrollbar)

export default Scrollbar;