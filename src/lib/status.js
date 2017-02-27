const Status = {
    READY:      'ready',      // the container is available for rendering but has not yet been rendered
    LOADING:    'loading',    // the container is currently in the process of being rendered
    EXPANDING:  'expanding',  // the container is currently in the process of expanding
    EXPANDED:   'expanded',   // the container is currently in expanded state
    COLLAPSING: 'collapsing', // the container is currently in the process of collapsing
    COLLAPSED:  'collapsed',  // the container is currently in the initial state
    ERROR:      'error'       // the container has experienced an error that is preventing any interaction
};

export {Status as default};
