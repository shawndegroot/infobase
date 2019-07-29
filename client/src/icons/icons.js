import './icons.scss';

const IconHome = (props) => {
  const {
    title,
  } = props;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="icon--svg-inline" aria-labelledby={title}>
      <path fill="none" d="M0 0h24v24H0V0z"/>
      <path className="svg-fill" d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
    </svg>
  );
};


const IconFeedback = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 600 600" className="icon--svg-inline" aria-labelledby={title}>
      <path className="svg-stroke" fill="none" strokeWidth="50" strokeMiterlimit="10" d="M549.9,503.3c2.3-0.5-8.6-13.2-10.8-17.7
        l-42.3-68.5c20.8-17.4,54.2-67.8,52.3-113.1c-4.2-100.9-112-182.8-250.2-182.8S48.7,203,48.7,304s112,182.9,250.2,182.9
        c45.4,0,81.3-4.8,118-20.2C520.2,497.5,536.1,506.3,549.9,503.3z"/>
    </svg>

  );
};

const IconAbout = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 600 600" className="icon--svg-inline" aria-labelledby={title}>
      <path className="svg-stroke" fill="none" strokeWidth="50" d="M300,46C159.7,46,46,159.7,46,300
        s113.7,254,254,254s254-113.7,254-254S440.3,46,300,46z"/>
      <path className="svg-fill" d="M365.9,417c-23,46.4-53.9,69.5-72.4,73.1c-17.4,3.5-26.2-12.3-24.3-53.9c1.9-50.1,3.4-82,4.6-126.9
        c0.3-18.1-0.9-24.1-7.4-22.8c-7.6,1.5-18.6,14.4-26.3,26.7l-6.4-6.6c19.1-34.3,53.7-67.7,74.3-71.8c19-3.8,23,13.5,22.1,62.8
        c-1.4,41-2.9,81.9-4.4,122.3c-0.8,16,2.9,20.3,7.8,19.3c3.8-0.8,13.1-7.7,26-28.3L365.9,417z M323.9,144.2
        c3.7,18.5-4.8,38.2-23.3,41.9c-15.2,3-27-5.3-30.5-22.7c-3.1-15.8,3.8-37.5,25-41.7C310.9,118.5,321.1,130,323.9,144.2z"/>
    </svg>

  );
};

const IconGlossary = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 600 600" className="icon--svg-inline" aria-labelledby={title}>
      <g>
        <path fill="none" className="svg-stroke" strokeWidth="50" strokeLinecap="round" strokeMiterlimit="50" d="M138.5,57h322.9
          c18.7,0,33.8,15.1,33.8,33.8v418.4c0,18.7-15.1,33.8-33.8,33.8H138.5c-18.7,0-33.8-15.1-33.8-33.8V90.8
          C104.8,72.1,119.9,57,138.5,57z"/>
        
        <line fill="none" className="svg-stroke" strokeWidth="25" x1="178" y1="63.5" x2="178" y2="542.5"/>
      </g>
      <path className="svg-fill" d="M303.1,466c0-1.9,0.7-3.8,2-5.3
        l105.8-125.9v-0.7h-89.5c-5.1,0-9.2-3.8-9.2-8.6l0,0c0-4.7,4.1-8.6,9.2-8.6h112.9c5.1,0,9.2,3.8,9.2,8.6v0.9c0,1.9-0.7,3.8-2,5.3
        L336.2,457.2v0.7h99.5c5.1,0,9.2,3.8,9.2,8.6l0,0c0,4.7-4.1,8.6-9.2,8.6H312.2c-5.1,0-9.2-3.8-9.2-8.6L303.1,466z"/>
      <path className="svg-fill" d="M257.4,253.4l-15.3,40.3
        c-1.5,3.9-5.2,6.5-9.4,6.5h-4.4c-5.5,0-10-4.5-10-10c0-1.2,0.2-2.5,0.7-3.7l58.2-149.3c1.5-3.8,5.2-6.4,9.3-6.4h16.6
        c4.1,0,7.8,2.5,9.3,6.4L371,286.6c2,5.1-0.5,10.9-5.7,13c-1.2,0.5-2.4,0.7-3.6,0.7h-5.3c-4.1,0-7.8-2.5-9.3-6.4l-15.8-40.5
        c-1.5-3.8-5.2-6.4-9.3-6.4h-55.2C262.6,247,258.9,249.5,257.4,253.4z M308.9,229.9c5.5,0,10-4.5,10-10c0-1.2-0.2-2.5-0.7-3.6
        l-13.7-35.1c-4.3-11-7.2-21.1-10.1-30.9h-0.6c-2.9,10.1-6.1,20.3-9.8,30.6l-13.7,35.4c-2,5.1,0.6,10.9,5.7,12.9
        c1.2,0.4,2.4,0.7,3.6,0.7L308.9,229.9L308.9,229.9z"/>
    </svg>
  );
};

const IconDataset = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg version="1.1" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 600 600" className="icon--svg-inline" aria-labelledby={title}>
      <path fill="none" className="svg-stroke" strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" d="M116.5,98.5h367
        c6.6,0,12,5.4,12,12v394c0,6.6-5.4,12-12,12h-367c-6.6,0-12-5.4-12-12v-394C104.5,103.9,109.9,98.5,116.5,98.5z"/>
      <line fill="none" className="svg-stroke" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="190.5" x2="494.5" y2="190.5"/>
      <line fill="none" className="svg-stroke" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="272.5" x2="495.5" y2="272.5"/>
      <line fill="none" className="svg-stroke" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="354.5" x2="495.5" y2="354.5"/>
      <line fill="none" className="svg-stroke" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="104.5" y1="434.5" x2="495.5" y2="434.5"/>
      <line fill="none" className="svg-stroke" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="234.5" y1="197.5" x2="234.5" y2="515.5"/>
      <line fill="none" className="svg-stroke" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round" x1="365.5" y1="194.5" x2="365.5" y2="515.5"/>
    </svg>
  );
};

const IconShare = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="icon--svg-inline" aria-labelledby={title}>
      <path d="M0 0h24v24H0z" fill="none"/>
      <path className="svg-fill" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34
        3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65
        0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
    </svg>
  );
};

const IconPermalink = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30" className="icon--svg-inline" aria-labelledby={title}>
      {/* 
      Copyright Wikimedia
      
      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
      to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
      and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
      
      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
      
      The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability,
      fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other
      liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings
      in the Software.
      */}
      <g className="svg-fill" >
        <path d="M20.437 2.69c-3.37 0-5.778 3.05-8.186 5.297.322 0 .804-.16 1.285-.16.803 0 1.605.16 2.408.48 1.284-1.283 2.568-2.727 4.494-2.727.963 0 2.087.48 2.89 1.123 1.605 1.605 1.605 4.174 0 5.78l-4.174 4.172c-.642.642-1.926 1.124-2.89 1.124-2.246 0-3.37-1.446-4.172-3.212l-2.086 2.087c1.284 2.408 3.21 4.173 6.1 4.173 1.926 0 3.69-.802 4.815-2.086l4.172-4.174c1.445-1.444 2.408-3.21 2.408-5.297-.32-3.53-3.53-6.58-7.063-6.58z"/>
        <path d="M13.535 22.113l-1.444 1.444c-.64.642-1.925 1.124-2.89 1.124-.962 0-2.085-.48-2.888-1.123-1.605-1.605-1.605-4.334 0-5.778l4.174-4.175c.642-.642 1.926-1.123 2.89-1.123 2.246 0 3.37 1.605 4.172 3.21l2.087-2.087c-1.284-2.407-3.21-4.173-6.1-4.173-1.926 0-3.692.803-4.815 2.087L4.547 15.69c-2.73 2.73-2.73 7.063 0 9.63 2.568 2.57 7.062 2.73 9.47 0l3.05-3.05c-.482.162-.963.162-1.445.162-.803 0-1.445 0-2.087-.32z"/>
      </g>
    </svg>
  );
};

const IconDownload = (props) => {
  const {
    title,
  } = props;
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="icon--svg-inline" aria-labelledby={title}>
      <path className="svg-fill" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  );
};



export {
  IconHome,
  IconFeedback,
  IconAbout,
  IconGlossary,
  IconDataset,
  IconShare,
  IconPermalink,
  IconDownload,
};
  