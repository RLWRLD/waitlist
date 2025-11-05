### Why 5-Finger Dexterity?

What makes the human hand extraordinary is not just its structure, but the way five independent fingers act in concert to achieve unparalleled precision. This structure allows us to grasp, rotate, and manipulate objects of many shapes and sizes. However, most industrial and humanoid robots still use simple grippers such as parallel-jaw, suction, or 3- to 4-finger types. These usually offer only 1 to 7 degrees of freedom (DoF), enough for basic pick-and-place but not for complex manipulation.

A parallel-jaw gripper can only open and close, and even advanced 3-finger versions are limited to cylindrical or spherical grasps. Crucially, such systems cannot perform **in-hand manipulation** (like rotating or repositioning objects) or **use tools** like screwdrivers, pens, or tweezers. As a result, they fail when tasks require dexterous manipulation skills.

At RLWRLD, we believe dexterity is not about the hand itself. It's about the intelligence behind it. Powered by **RLDX** ("Real-Dex"), our dexterity robotics foundation model, a 5-finger humanoid hand like ALLEX can perform tasks once thought impossible: **opening bottle caps, unpacking boxes, even writing with a pen.**

We will unveil more details of **RLDX by Q1 next year.**

### Lessons Learned from "Pouring Milk" with Humanoid Form-Factor

https://youtu.be/AY7shah5xiw?si=Az5GeiPcrkpdsPZp

#### Multi-modal Sensory Integration and Motion Planning

At first glance, performing a task such as "pouring milk" with a humanoid robot may appear simple, but in reality it requires the integration of multiple sensory modalities and highly sophisticated planning capabilities. Even an initial action like "unscrewing the bottle cap," which feels effortless to humans, demands a precise combination of visual intelligence, 5-finger dexterity, tactile sensing, and force control from the robot.

#### Unscrewing the Bottle Cap

At this stage, the robot coordinates **fine-grained finger kinematics with real-time force regulation**. Rather than simply applying torque, three fingers dynamically rotate and reposition around the cap through flexion–extension and subtle abduction–adduction motions, creating the stable tri-point contact needed for continuous turning. Torque sensors still play a key role by keeping the applied force within an optimal range to prevent slippage, while tactile feedback ensures secure contact and detects the moment the cap begins to loosen.

![opening-cap.gif](attachment:50bd2ec4-d405-407e-a46e-721734831f76:opening-cap.gif)

#### Lifting Bottle and Moving Toward Cup

After opening the cap, the process of lifting the bottle and moving it toward the cup relies heavily on vision and motion planning. **Visual intelligence** enables the robot to recognize the cup's position and precisely align the bottle's opening with it. During this process, the tactile sensor continuously monitors whether the bottle is being held securely and checks for any slippage as the center of gravity shifts.

#### Pouring Milk

Finally, the act of pouring milk involves more than simply tilting the bottle. As the bottle tilts, torque sensing continuously tracks changes in the center of gravity and the angle of inclination, helping to maintain a steady flow of liquid. Meanwhile, tactile sensors detect subtle slippage or vibrations between the bottle's surface and the robot's fingers.

![pouring-milk.gif](attachment:b76e0885-9c7a-4b39-a614-9d78ed9040e6:pouring-milk.gif)

**From unscrewing the bottle cap to pouring milk into the cup, every step requires torque, tactile sensing, vision, and high-level task planning, all working together in close coordination.** Only when these different modalities complement and support one another can the robot achieve manipulation that is as delicate and natural as a human hand. Ultimately, even a seemingly simple task like pouring milk is a highly complex problem that requires the integration of **multi-modal sensing, closed-loop control, and high-level task planning**.

Through this process, we gained an important insight: **a planned trajectory is not always executable.** Prediction-based planning alone cannot account for all the irregularities that arise in the real world. These experiences taught us that successful manipulation requires a structure where planning and sensory feedback work in tight coordination, adjusting actions in real time.

Building on this insight, **RLDX** takes the next step: leveraging **end-to-end learning and VLA (Vision-Language-Action) architectures** to unify perception, reasoning, and control into a single intelligent system.

### RLDX with VLA (TEMPORARY)

Traditional robotic systems operate through a sequential pipeline: perception → planning → control. This separation creates fundamental limitations because each stage operates in isolation, making real-time adaptation difficult when the real world deviates from predictions.

RLDX takes a different approach. By integrating **Vision-Language-Action (VLA) architectures** with multi-modal sensory feedback, RLDX unifies perception, reasoning, and control into a single end-to-end model. The system directly processes visual input alongside **tactile sensing and torque feedback**, enabling the robot to continuously refine its actions based on real-time physical interaction.

#### Latent Action History for Adaptive Control

At the core of RLDX is a **latent action representation** that encodes manipulation dynamics in a compressed space. Rather than predicting raw joint commands at each timestep, RLDX maintains a **latent action history** that captures the temporal structure of manipulation tasks. This allows the model to:

- Learn generalizable manipulation primitives that transfer across different tasks and objects
- Adapt to unexpected perturbations by conditioning on recent action context
- Generate smooth, coordinated multi-finger motions rather than discrete, reactive movements

When unscrewing a bottle cap, for example, RLDX doesn't just react to the current visual frame and force readings. It leverages the history of finger rotations, grip adjustments, and torque patterns to predict what comes next, enabling fluid manipulation even when visual occlusion or sensor noise would otherwise cause failures.

#### Augmenting Spatial and Temporal Reasoning

While Vision-Language Models (VLMs) provide strong semantic understanding and common-sense reasoning, they are not inherently designed for the precise spatial and temporal reasoning required for dexterous manipulation. RLDX **augments the VLM's spatial and temporal reasoning capabilities** through:

- **Spatial grounding**: Learning fine-grained 3D spatial relationships between the robot's fingers, objects, and contact points, going beyond the 2D scene understanding of standard VLMs
- **Temporal modeling**: Encoding multi-step action sequences and object dynamics over extended time horizons, allowing the model to anticipate how objects will respond to manipulation
- **Closed-loop refinement**: Continuously integrating tactile and torque feedback to adjust predictions in real-time, rather than relying solely on open-loop visual planning

This augmentation allows RLDX to bridge the gap between high-level task understanding ("unscrew the cap") and low-level sensorimotor control (coordinating finger forces and rotations frame-by-frame).

#### Real-Time, Embodiment-Agnostic Architecture

RLDX is optimized for **sub-100ms observation-to-action latency**, ensuring responsive closed-loop control. The architecture is designed to be **embodiment-agnostic**, allowing rapid adaptation to different robotic hands and manipulators without retraining from scratch.

---

**RLDX represents a new approach to robotic dexterity**: by unifying multi-modal sensing with latent action representations and augmented spatial-temporal reasoning, the model learns to manipulate objects with the adaptability and fluidity that has long been exclusive to biological hands.

More details coming Q1 2026.
