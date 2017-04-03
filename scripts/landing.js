var pointsArray = document.getElementsByClassName('point');

var animatePoints = function (points) {
    var points = document.getElementsByClassName('point');

    var revealPoint = function (index) {
        points.style.opacity = 1;
        points.style.transform = "scaleX(1) translateY(0)";
    }

    forEach(points, revealPoint);
};

window.onload = function() {
     //Automatically animate the points on a tall screen whree scrolling can't trigger the animation
    if (window.innerHeight > 950) {
        animatePoints(pointsArray);
    }

    var sellingPoints = document.getElementsByClassName('selling-points')[0];
    var scrollDistance = sellingPoints.getBoundingClientRect().top - window.innerHeight + 200;
    window.addEventListener('scroll', function(event) {
        if (document.documentElement.scrollTop || document.body.scrollTop >= scrollDistance) {
             animatePoints(pointsArray);
        }
    });
}
