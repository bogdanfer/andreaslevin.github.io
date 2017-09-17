const vW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

// Init Parallax
// with TEMP mobile solution

if (vW > 1024) {
	// parallaxIt();
}

document.addEventListener('DOMContentLoaded', function() {
    const moving__background = document.querySelector('.parallax');

    if (vW > 1024) {
	    window.addEventListener( 'scroll', function() {
	        ParallaxAnimation( moving__background );
	    });
	}
});

function ParallaxAnimation( el ) {
    let scrollTop = document.body.scrollTop;
    let delta = -(scrollTop / 6);

	el.style.webkitTransform = 	'translate3d(0, ' + delta + 'px , 0)';
	el.style.MozTransform 	 = 	'translate3d(0, ' + delta + 'px , 0)';
	el.style.msTransform 	 =	'translate3d(0, ' + delta + 'px , 0)';
	el.style.OTransform 	 =	'translate3d(0, ' + delta + 'px , 0)';
	el.style.transform 		 =  'translate3d(0, ' + delta + 'px , 0)';
};