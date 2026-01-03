export const rubberbandScroll = (element, target, options = {}) => {
    // Spring physics constants
    // Tension: Stiffness of the spring (higher = faster snap)
    // Friction: Damping (lower = more oscillation)
    // Mass: Weight (higher = slower acceleration)
    // Tuned for "rock back a couple of times": Lower friction -> more oscillation.
    const tension = options.tension || 150; // Slightly reduced tension (slower)
    const friction = options.friction || 8; // Reduced friction (more bounce)
    const mass = options.mass || 1;
    const epsilon = 0.1; // Threshold to stop animation

    let position = element.scrollTop;
    let velocity = 0;

    // If we're already at the target, force a small displacement to trigger the effect
    // This ensures the user feels the "action" even if no scroll is needed
    if (Math.abs(position - target) < 1) {
        if (target === 0) {
            // Pull down slightly so it snaps back up
            // Re-tuned to 35 for better visibility
            position = 35;
            element.scrollTop = position;
        } else {
            // Pull up slightly so it snaps back down
            // Re-tuned to 35 for better visibility
            position = target - 35;
            element.scrollTop = position;
        }
    }

    let lastTime = performance.now();
    let animationFrameId;

    const animate = (currentTime) => {
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Limit dt for stability
        lastTime = currentTime;

        // Spring force = -k * x (Hooke's Law)
        const displacement = position - target;
        const springForce = -tension * displacement;

        // Damping force = -c * v
        const dampingForce = -friction * velocity;

        // Acceleration = F / m
        const acceleration = (springForce + dampingForce) / mass;

        // Euler integration
        velocity += acceleration * deltaTime;
        position += velocity * deltaTime;

        // Handle edge behavior
        const maxScroll = element.scrollHeight - element.clientHeight;
        let appliedPosition = position;
        let overshoot = 0;

        if (position < 0) {
            appliedPosition = 0;
            overshoot = position;
        } else if (position > maxScroll) {
            appliedPosition = maxScroll;
            overshoot = position - maxScroll;
        }

        element.scrollTop = appliedPosition;

        // Apply visual overshoot if wrapper is provided
        if (options.wrapper) {
            if (Math.abs(overshoot) > 0.5) {
                options.wrapper.style.transform = `translateY(${-overshoot}px)`;
            } else {
                options.wrapper.style.transform = 'none';
            }
        }

        // Check if we effectively reached equilibrium
        // Stop if close to target AND moving slowly AND no overshoot
        if (Math.abs(displacement) < epsilon && Math.abs(velocity) < epsilon && Math.abs(overshoot) < epsilon) {
            element.scrollTop = target; // Snap to exact target
            if (options.wrapper) {
                options.wrapper.style.transform = 'none';
            }
            cancelAnimationFrame(animationFrameId);
            return;
        }

        animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Return a cancel function in case needed
    return () => cancelAnimationFrame(animationFrameId);
};
