import {Children, Fragment, cloneElement, useRef, useEffect, useState, useCallback} from 'react';

import './scrollbar.css';

function Scrollbar(props){
  let ref = useRef({});
  let [top, setTop] = useState(null);
  let [height, setHeight] = useState(null);
  let [display, setDisplay] = useState(true);

  let updateScrollbar = useCallback(() => {
    let elem = ref.current;
    
    let clientHeight = elem.clientHeight; //visable height of the main element
    let scrollHeight = elem.scrollHeight; //amount the element has been scrolled
    let scrollTop = elem.scrollTop; //amount the element can be scrolled

    let percentageScrolled = (scrollTop) / (scrollHeight - clientHeight); //right now it caps where the slider maxes out but whatever ill cross that bridge when i get there
    let percentageOfPageVisible = (clientHeight / scrollHeight);

    let thumbHeight = percentageOfPageVisible * clientHeight;
    let thumbTop = percentageScrolled * (clientHeight - thumbHeight);

    setTop(thumbTop);
    setHeight(thumbHeight);
    console.log('fired');
  },[ref.current, setTop, setHeight]);

  //connect to scroll wheel
  useEffect(() => {
    ref.current.addEventListener('scroll', updateScrollbar);

    return () => {
      ref.current.removeEventListener('scroll', updateScrollbar);
    }
  })

  //observe size change
  useEffect(() => {
    let observer = new ResizeObserver(updateScrollbar)

    if (ref.current){
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    }
  })



  /*
  both of these should be tacked with a resize observer
  useEffect(() => {
    if (ref.current.clientHeight >= ref.current.scrollHeight){
      setDisplay(false);
    }
  });

  useEffect(() => {
    updateScrollbar();
  }, [scrllheight]);*/

  
  

  let child = Children.only(props.children);
  return (
    <Fragment>
      {cloneElement(child, {...child.props, ref})}
      <div className = 'scrollbar_track' style = {{top:ref.current?.getBoundingClientRect?.()?.y ?? null,display:display ? null : 'none'}}>
        <div className = 'scrollbar_thumb' style = {{top,height}}></div>
      </div>
    </Fragment>
  )
}

  console.log(Scrollbar)

export default Scrollbar;