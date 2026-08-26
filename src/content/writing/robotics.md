---
title: 'Robotics'
description: 'A first-principles deep-dive from SLAM to robot foundation models — and why general-purpose humanoids remain years away, gated not by hardware, planning, or capital, but by the reliability of dexterous manipulation.'
date: 'August 25, 2026'
tags: 'robotics, humanoids, foundation models'
readingTime: 48
cover: '/writing/robotics-shadow-hand.jpg'
coverAlt: 'A Shadow Dexterous Hand pinching an incandescent light bulb between thumb and forefinger'
draft: false
---

<figure>
  <img src="/writing/robotics-shadow-hand.jpg" alt="A Shadow Dexterous Hand pinching an incandescent light bulb between thumb and forefinger against a blue background" width="1600" height="1000" />
  <figcaption>The Shadow Dexterous Hand holding a light bulb. Photograph by Richard Greenhill and Hugo Elias, Shadow Robot Company, <a href="https://commons.wikimedia.org/wiki/File:Shadow_Hand_Bulb_large.jpg" target="_blank" rel="noreferrer noopener">via Wikimedia Commons</a>, CC BY-SA 3.0.</figcaption>
</figure>

A deep-dive on the entire history of robotics, highlighting the series of innovations that
have enabled general-purpose humanoids like Optimus, Figure, and the new wave of Chinese
humanoids.

We will see that fully autonomous humanoids may be much farther away than the current
narratives suggest — even as capital, deployments, and demos accelerate around them.

---

## Overview

Riding the tailwinds of recent progress in deep learning, robotics has again regained the
spotlight, with companies deploying enormous amounts of capital to develop general-purpose
humanoids. [Tesla Optimus](https://www.tesla.com/we-robot),
[Figure](https://www.figure.ai/), and [1X](https://www.1x.tech/) are building humanoids;
[Physical Intelligence](https://www.physicalintelligence.company/) and
[Skild](https://www.skild.ai/) are building the robotics foundation models meant to
control them. The numbers are staggering: Figure raised over $1B at a
[$39B post-money valuation](https://www.prnewswire.com/news-releases/figure-exceeds-1b-in-series-c-funding-at-39b-post-money-valuation-302556936.html),
Skild closed a round at [over $14B](https://www.skild.ai/blogs/series-c), Physical
Intelligence sits at
[$5.6B](https://www.bloomberg.com/news/articles/2025-11-20/robotics-startup-physical-intelligence-valued-at-5-6-billion-in-new-funding),
and Apptronik at
[~$5B](https://news.crunchbase.com/venture/ai-humanoid-robot-funding-apptronik/).

And this is no longer just a Western race. The largest humanoid *shippers* in the world are
now Chinese — [Unitree](https://www.unitree.com/), which filed a
profitable-hardware-business
[STAR Market IPO](https://www.therobotreport.com/unitree-ipo-shows-a-real-hardware-business-the-humanoid-case-is-still-early/),
and [AgiBot / Zhiyuan 智元](https://github.com/OpenDriveLab/AgiBot-World), backed by
Tencent and producing the largest open robotics dataset in existence.

Given all the hype, twitter sentiment, venture narratives, and recent demos (see:
[Tesla Optimus](https://www.youtube.com/watch?v=cpraXaw7dyc),
[Figure Helix](https://www.figure.ai/news/helix), [1X NEO](https://www.1x.tech/neo)), it
may seem like fully autonomous humanoids are right around the corner. Some founders now
claim general-purpose humanoids working in unseen homes are
[a year or two away](https://www.humanoidsdaily.com/).

However, the technical realities of current robotics progress point to a very different
future than what these narratives suggest. The robots can sprint, backflip, and grasp
thousands of novel objects — yet on honest, standardized benchmarks the best systems in the
world still complete only [12–44%](https://arxiv.org/abs/2510.17950) of real manipulation
tasks, and nearly every headline "fully autonomous" deployment turns out to rest on company
assertion with no independent audit.

To see this realistic future of the robotics industry, we'll first need to understand the
series of innovations that have gotten robotics technology to its current state.

Then, we'll use this to explore the answers to the following questions:

- What are state-of-the-art robots currently capable of?
- What are the constraints limiting progress toward fully-autonomous generally-intelligent robotics?
- What is the path to successfully build generally-intelligent robots?
- How long will it take to create generally-intelligent robots?
- Who will win the humanoid arms race?
- What does this mean for investment and company building in the robotics industry?

Let's start by understanding the fundamentals of robotics from first principles.

---

## 1. Fundamentals

Robotics is about building systems that can alter the physical world to accomplish
arbitrary goals.

Practically, we're interested in creating robots capable of automating the majority of
economically valuable physical labor.

At the simplest level, **robots convert ideas into actions**.

> In order to accomplish this, robotic systems need to:
>
> 1. Observe and understand the state of their environment
> 2. Plan what actions they need to take to accomplish their goals
> 3. Know how to physically execute these actions with their hardware
>
> These requirements cover the 3 essential functions of all robotic systems:
> **perception**, **planning**, and **control**.

We may initially expect that planning is the hardest of these problems, since it depends on
complex reasoning.

However, we will see that the opposite is the case — planning is the easiest of these
problems and is largely solved today.

Meanwhile, the biggest barrier to progress in robotics today is in developing reliable
control systems, and specifically dexterous manipulation.

The end goal of robotics is to achieve full **autonomy** and broad **generalization**.

We don't want a robot that's specialized for just a single goal, task, object, or
environment; such robots already exist in a variety of areas (especially in industrial
automation).

Instead, we want a robot that can accomplish any goal, perform any task, on any object, in
any environment, without the help of any human.

With such general purpose robotic systems available, we would have what
[Eric Jang](https://x.com/ericjang11) calls a
"[read/write API to physical reality](https://evjang.com/2024/03/03/all-roads-robots.html),"
where we could make all desired changes to the physical world by issuing commands to robots
using software alone.

This is the holy grail of robotics. Such a system would be so economically valuable that
the prospect of it has motivated the billions of dollars flowing into the industry today,
as it would generate trillions of dollars for the world (and thus, for investors).

From here on, I'll refer to these fully autonomous, generally intelligent, and broadly
capable robotic systems as **general-purpose robotics**.

Before we can understand how close we are to the goal of general-purpose robotics, we first
need to look at the series of innovations that have gotten us to the current state of
robotics.

---

## 2. Progress

The challenge of developing general-purpose robotics is both a hardware and a software
problem.

Since a robot's software is entirely dependent on its hardware for sensory inputs and
control outputs, we'll briefly cover robotics hardware first. Though it's important, we'll
see that hardware is not the current bottleneck to progress — with one sharp and instructive
exception: the hand.

Then, we'll turn to understanding the series of software innovations over the past decade
that are largely responsible for the recent interest in robotics.

### 2.1 Hardware

A robot is made of a group of **rigid bodies**, connected by **joints**, driven by
**actuators**, with collocated **sensors** and **compute**.

Each of these parts corresponds with one of the 3 critical functions of a robot:

1. Cameras, LiDAR, IMUs, and other sensors allow the robot to perceive its environment.
2. Actuators let the robot move at its joints, allowing it to move itself relative to its environment, or to move objects relative to its environment.
3. Compute is used to process sensory information, convert it into action plans, and execute these action plans by controlling actuators.

> Though there are a number of hardware considerations that will have an important impact
> on the scalability and functionality of general-purpose robotics, **hardware has not been
> the primary constraint limiting robotics progress for a few decades.**
>
> For example, [here's a video](https://www.youtube.com/watch?v=o7JH3UWO6I0) of the PR-1
> robot from 2008. We can see that even 15 years ago, it was capable of doing pick and place
> tasks that some robots still struggle with today. Additionally, its hardware resembles
> that used in many modern robotics research papers like
> [SayCan](https://arxiv.org/pdf/2204.01691).

#### Considerations

Designing general-purpose robotic hardware involves several trade-offs that have to be
balanced:

1. **Degrees of Freedom** — The robot needs enough degrees of freedom of movement for it to perform a diversity of tasks, like climbing stairs, traversing uneven terrain, opening doors, and manipulating various objects.
2. **Configuration Complexity** — While we want robots with sufficient degrees of freedom, more complex configurations also mean more difficulty training robotic control systems. The hardware must strike a balance between flexibility and simplicity.
3. **Torque vs. Weight** — Robotic actuators need to have a high torque to weight ratio, so they can lift objects and manipulate the environment without weighing down the robot and impeding its movement.
4. **Safety** — Robots that are meant to operate in environments with humans must pay attention to their safety. This requires actuators with low rotational speeds to prevent injury to nearby humans (check out [this blog post on motor physics and safety](https://evjang.com/2024/08/31/motors.html) for more depth).
5. **Cost** — If general-purpose robots are to be deployed at scale, they need to be cheap enough to mass produce, and eventually, to be purchased by consumers. This means costly sensors like LiDAR and other expensive hardware have a high opportunity cost.

The cost trade-off is no longer hypothetical. Chinese manufacturers have driven entry-level
humanoid prices into consumer territory by reusing the EV supply chain for actuators and
batteries: the [Unitree G1](https://www.unitree.com/g1/) sells for around **$13,500**, and
the smaller Unitree R1 for around **$5,900**. A general-purpose consumer humanoid like the
[1X NEO](https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/)
is priced at **$20,000** (or $499/month). These prices were unthinkable a few years ago,
and they confirm that the *body* is reaching mass-production economics.

#### Form Factor

In addition to these trade-offs, selecting a specific robotic form factor has important
downstream consequences on future improvements.

We will see that robotic software is heavily dependent on data collected from exactly the
same robot that it's meant to be deployed on. Robotic software learns to take actions based
on the exact joint, sensor, and actuator data it is trained on.

Significantly altering the robot's hardware over time means prior software, and most
importantly data (which we will see is extremely difficult to collect), becomes obsolete.

> Companies that are able to maintain the same hardware over time will benefit from the
> **compounding advantages** of:
>
> 1. Deploying robots in the world
> 2. Collecting diverse real-world datasets
> 3. Using this data to train improved models for their robots
> 4. Using these improved models to generate more deployments and revenue
> 5. Using the excess revenue to further fuel this process
>
> For this reason, **it's important that robotics companies design hardware systems that
> are sufficiently general**, so they can keep reaping the rewards of this data flywheel
> without having to alter their hardware.

**This is exactly why so many companies have now opted to develop humanoids.**

Their argument is that the world is designed for humans, so humanoids will be generally
capable of performing most tasks in our world.

In other words, they believe that the humanoid form factor is sufficiently general such
that they will be able to focus on collecting data and improving their software over time
without having to alter their hardware too much.

> There has also been significant progress developing quadruped robots over the past decade
> from companies like [Unitree](https://www.unitree.com/) and
> [Boston Dynamics](https://bostondynamics.com/products/spot/), though this form factor is
> far less generally capable, so I won't focus on it in this deep dive.

#### Humanoids

Since most large robotics companies have now bet on the humanoid form factor, let's look at
the hardware capabilities of modern humanoid systems.

The body has largely converged into a recognizable archetype: roughly 1.6–1.8 m tall,
30–73 kg, vision from cameras only (no LiDAR, for cost), on-board AI compute for running
multi-modal model inference, and high degree-of-freedom dexterous hands. We can pick up on
a few important considerations:

- They have high degree-of-freedom hands with dexterous manipulation capabilities — the field has converged on roughly **22-DOF, tendon-driven hands with the actuators relocated into the forearm** (as on the [Tesla Optimus Gen 3](https://www.teslarati.com/tesla-optimus-v3-hand-arm-details-revealed-new-patents/) hand, [Figure 03](https://www.figure.ai/news/introducing-figure-03), [1X NEO](https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/), and Apptronik Apollo). These enable much more complex motor control, though they are orders of magnitude more difficult to build *and* to train than simple graspers.
- They use only cameras for vision, opting against LiDAR systems often used on quadrupeds (due to cost optimization for mass production).
- They have AI compute on board, which can be used for running multi-modal model inference. Modern robotics software has adapted these models to be an essential part of their control systems.

> **The dexterous hand is the one place where hardware genuinely is a bottleneck today.**
> Tesla physically scaled back Optimus assembly in 2025 over hand and forearm reliability
> problems — reportedly a
> [hand lifespan of only ~6 weeks and a cost over $6,000](https://www.trendforce.com/news/2025/10/10/news-tesla-reportedly-scales-back-optimus-production-as-hand-design-issues-stall-assembly/)
> — leaving bodies finished but handless. Elon Musk later
> [admitted](https://www.basenor.com/blogs/news/tesla-optimus-gen-3-hand-patents-revealed-25-actuators-22-dof)
> that the patented V3 hand "didn't actually work" (it passed in simulation, failed in
> reality) and that the design was scrapped for a new one. Almost every major player shipped
> a *new* dexterous hand design in this period, which means the manipulation data flywheel
> keeps getting reset by hardware that is still changing underneath it.

Most importantly, though these robots are expensive and have limited battery life, the
*body's* basic functionality is sufficient to accomplish most physical labor. The remaining
hardware challenge is concentrated almost entirely in the hand.

With this context in mind, we can turn to robotic software, which is where the real
bottleneck to general-purpose robotics lives.

### 2.2 Software

Software is where most of the progress in robotics has occurred over the past decade, and
is the place we must look to understand where the future of robotics is headed.

In this section, we'll focus on the series of innovations that have led us to the current
frontier of robotic software. Then, we'll use this to understand the limitations of current
capabilities, and what we must accomplish to achieve general-purpose robotics.

#### Moravec's Paradox

Robotic software is responsible for using sensor data and actuators to process the robots'
**perception**, **plan** actions, and issue **control** commands.

In this sense, it represents the "brain" of the robot.

We may initially expect that planning is the most difficult of these functions, since it
requires high-level reasoning abilities, understanding of environmental context, natural
language, and more.

Meanwhile, controlling limbs to grab and manipulate objects seems comparatively simple.

In reality, the opposite is the case. Planning is the easiest of these functions and is now
largely solved with vision-language models, whereas creating effective and *reliable* motor
control policies is the main constraint limiting progress today.

> This counter-intuitive difficulty of robotic control is captured in **Moravec's paradox**:
>
> "Moravec's paradox is the observation in the fields of artificial intelligence and
> robotics that, contrary to traditional assumptions, reasoning requires very little
> computation, but sensorimotor and perception skills require enormous computational
> resources." — [Wikipedia](https://en.wikipedia.org/wiki/Moravec%27s_paradox)
>
> We can see the truth in this in the fact that modern AI systems have long been able to
> accomplish complex reasoning tasks like beating the best human chess and Go players,
> passing the Turing test, and now being more intelligent than the average human, all while
> robots consistently fail to perform basic sensorimotor tasks that a 1-year-old human
> could, like grasping unfamiliar objects.

Moravec's paradox is not really a paradox; it is instead a direct result of the complexity
of the real world.

Tasks that seem simple to us often actually require complex multi-step motor routines; an
intuitive understanding of real world kinematics and dynamics; calibration against variable
material frictions; and resistance against external disruptive forces.

Meanwhile, symbol manipulation is a relatively lower-dimensional and less complex problem,
as we have seen with the recent success of LLMs.

To get a sense for this complexity that we often fail to appreciate, check out
[this video where Eric Jang annotates all the motor routines required to open a package of dates](https://www.youtube.com/watch?v=b1lysnGFpqI).

The truth of Moravec's paradox is also reflected in the human brain, which has far more
computational resources allocated toward controlling our hands and fingers than the rest of
our body (check out these
[images of the cortical homunculus](https://en.wikipedia.org/wiki/Cortical_homunculus#Representation),
which show what the human body would look like if body parts were scaled in proportion to
the neural compute allocated to them — the hands are gigantic).

The clearest modern confirmation of Moravec's paradox is the asymmetry in how the
subsystems have matured: perception and locomotion are essentially solved, planning is
carried entirely by pretrained models, and yet a humanoid that can sprint at human speed
and do a standing backflip still cannot reliably fold an unfamiliar shirt.

#### 2.2.1 Perception

Robotic perception is concerned with processing sensory data about the robot's environment
to understand the structure of the environment, the presence and location of objects in the
environment, and its own position and orientation within the environment.

All of these necessities require the robot to construct an internal representation of its
environment that it can update as it explores and reference in its decision-making.

This is exactly the goal of SLAM systems.

> Sensory perception is also a significant part of robotic control since control heavily
> depends on sensorimotor policies, but we will cover that aspect of perception separately
> in the control section.

**Breakthrough #1: Early SLAM.** **Simultaneous Localization and Mapping (SLAM)** systems
use robotic sensor data to construct a consistent internal representation of the
environment (**mapping**) and to understand the robot's position in it (**localization**).

SLAM systems depend on a combination of LiDAR sensors, cameras, IMUs, and other sensors.
They use a technique called **sensor fusion** to synthesize all this data so it can be used
to construct a single map.

> **If sensors were perfectly accurate, SLAM could be trivially solved** — the robot would
> be able to understand its exact trajectory and could perfectly construct a map of its
> environment with point-wise depth data using LiDAR.
>
> **The challenge with SLAM comes in the fact that sensors have some error.**

As the robot navigates the environment, this error slowly accumulates, causing the robot to
miscalculate where it has moved (due to slightly inaccurate IMU readings) which then
distorts its understanding of the environment since this shifts the relative position of
different points.

SLAM solutions all solve this problem with the following process:

1. As the robot navigates through the environment, it stores the relative positions of points of interest around it.
2. The robot detects when it sees the same point of interest from multiple different perspectives.
3. It uses this data to triangulate the locations of all the different points of interest to reduce errors in localization and mapping.

Early SLAM solutions like
[EKF-SLAM and FastSLAM](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1638022)
used purely algorithmic methods like particle filters to construct a map of the
environment.

However, these solutions often relied on LiDAR sensors. This expensive dependency was
prohibitive for mass scale robotics, so the industry had to turn to SLAM solutions that
could work with only visual data from cameras.

**Breakthrough #2: Monocular SLAM.**
[ORB-SLAM](https://arxiv.org/pdf/1502.00956) represented a major breakthrough by providing a
SLAM solution that only depended on a single camera, with no dependence on LiDAR.

Because monocular systems don't have access to point-wise depth data from LiDAR that makes
SLAM much easier, they have to estimate relative camera and point positions from visual
data alone.

Monocular SLAM solutions accomplish this by detecting image features (like ORB features
which pick up on corners), and then triangulating these image features across key-frames
using strategies like **bundle adjustment** and **pose graph optimization**.

These solutions also started to integrate **loop closures** where a robot could perform
many error corrections and map readjustments every time it returned to the same location
(since errors in relative positions between points of interest become obvious).

**Breakthrough #3: SLAM with deep learning.** Modern SLAM solutions like
[DROID-SLAM](https://arxiv.org/pdf/2108.10869) and
[NeRF-SLAM](https://arxiv.org/pdf/2210.13641) started to integrate deep learning into their
systems to varying degrees. For a time, these systems still didn't look like internet-scale
models — they were primarily algorithmic solutions with heavy priors built into their
architecture, with deep learning integrated into just a few places.

**Breakthrough #4: Feed-forward 3D foundation models.** The most recent shift in perception
is the arrival of large *feed-forward* 3D foundation models that dispense with iterative
bundle adjustment entirely. [VGGT](https://github.com/facebookresearch/vggt) (the CVPR 2025
Best Paper) is a 1B-parameter transformer that, given anywhere from one to hundreds of
images, directly predicts camera poses, depth maps, point maps, and 3D point tracks **in
under a second** — no optimization loop. This is the deep-learning approach to perception
finally surpassing the classical algorithmic pipeline, and it is fast enough to run as a
perception front-end for a humanoid in real time.

> **Capabilities & Limitations: Perception**
>
> - Functional monocular and feed-forward visual perception now exist, with loop-closing, error recovery, and sub-second 3D reconstruction.
> - These solutions are good enough for navigation and spatial understanding on a humanoid.
> - **Perception is not the blocker** for deploying humanoid robots in the world.

#### 2.2.2 Planning

Robotic planning is about using an understanding of the environment to convert the robot's
goals into concrete action plans.

Specifically, this consists of **path planning**, **task planning**, and **motion
planning**. We will focus on path planning and task planning here, as low-level motion
planning is really the job of robotic control.

**Path planning.** The challenge of robotic path planning is primarily concerned with
safety; the robot needs to navigate its environment to a target position without colliding
with humans and objects in the environment.

Traditional path-finding algorithms like
[A*](https://ai.stanford.edu/~nilsson/OnlinePubs-Nils/PublishedPapers/astar.pdf) work to
find optimal paths in discrete and relatively simple environments, but robots operate in
complex environments with continuous configuration spaces (the number of specific
trajectories a robot could take from one location to another is near infinite).

To address this challenge, robots have to use random sampling based path planning
algorithms like
[Probabilistic Roadmaps (PRM)](https://www.cs.cmu.edu/~motionplanning/papers/sbp_papers/PRM/prmbasic_01.pdf)
and
[Rapidly-exploring Random Trees](https://msl.cs.illinois.edu/~lavalle/papers/Lav98c.pdf) to
create best-effort trajectory plans that avoid collisions. Then, they can use optimization
algorithms like [CHOMP](https://www.ri.cmu.edu/pub_files/2009/5/icra09-chomp.pdf) to ensure
that selected trajectories optimize smoothness in addition to just avoiding collisions.

> **Capabilities & Limitations: Path Planning**
>
> - Modern path planning systems can effectively generate best-effort trajectories in complex continuous environments.
> - These algorithms are capable of optimizing to avoid collisions and maximize smoothness.
> - Modern algorithms still struggle with path planning in the presence of dynamic objects in the environment (like walking humans).

**Task planning.** Robotic task planning involves converting the high-level goal of the
robot into sub-tasks and eventually individual motor routines to accomplish the goal.

This requires an understanding of the robot's environment and the objects within it, the
capabilities of the robot, and high-level reasoning abilities to plan within these
constraints.

Until a few years ago, task planning systems all used hierarchical symbolic approaches like
hierarchical task networks (HTN),
[STRIPS](https://ai.stanford.edu/~nilsson/OnlinePubs-Nils/PublishedPapers/strips.pdf) and
[Planning Domain Definition Language (PDDL)](https://arxiv.org/pdf/1106.4561) which allow
roboticists to manually define the domain of valid concepts to reason about.

This worked for simple environments where robots had a limited set of problems to consider
(like in industrial cases) but is not feasible for any general-purpose robotics system where
the complexity of environments quickly explodes.

This problem remained unsolved until the recent success of multi-modal LLMs provided access
to models with advanced visual and semantic reasoning capabilities.

Recent robotic systems like [SayCan](https://arxiv.org/pdf/2204.01691) and
[RT-2](https://arxiv.org/pdf/2307.15818) use pre-trained VLMs for their reasoning capacities
and fine-tune them to understand the capabilities afforded by robotic control systems. This
trend has only deepened: dedicated *embodied reasoning* models like
[Gemini Robotics-ER](https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/)
(built on Gemini 2.0) report 2–3× the end-to-end control success of the base model,
confirming that frontier-VLM reasoning transfers cleanly to embodied planning.

> **Capabilities & Limitations: Task Planning**
>
> - Modern task planning systems have advanced reasoning abilities and are grounded in the realities of actions that the robot can actually perform.
> - These systems have effectively integrated high-level task planning with low-level robotic control to accomplish goal-oriented behavior in complex environments.
> - Robotic task planning can now be considered a relatively solved problem.

#### 2.2.3 Control

As we've discussed, robotic control is by far the hardest part of building robotic systems
due to the incomprehensible complexity of the real world.

We are currently far from true generalization in this domain.

Robotic control deals with converting task and action plans from the robot's planning
system (ex: "pick up the ball," "open the pack of dates," "walk up the stairs") into actual
motor control outputs.

The approach to robotic control has gone through several major shifts over the past three
decades:

1. **Classical Control** — We initially tried to manually design robotic control policies with our own physics models, resembling early efforts in deep learning to accomplish manual feature engineering.
2. **Deep Reinforcement Learning** — Driven by progress in deep RL in the 2010s, reinforcement learning algorithms were successfully applied to learn robotic control policies, especially in simulation.
3. **Robotic Transformers** — Following recent progress in generative models, transformers trained on internet scale data have now been successfully re-purposed for robotics, producing the **vision-language-action (VLA)** model paradigm that dominates the frontier today.

Let's take a look at these major transitions, along with the other important breakthroughs
in robotic control that have gotten us to current capabilities.

**Breakthrough #1: Classical control.** The earliest approaches to robotic control involved
manual modeling of the kinematics and dynamics of the environment, robot joints, and rigid
bodies, using **forward** kinematics/dynamics models (predicting movement from motor
commands) and **inverse** models (predicting the motor commands needed for a desired
movement).

Though these models saw some success in highly-controlled environments, they quickly fell
apart with any variance as the countless un-modeled forces, unpredictable variable
frictions, and sensor inaccuracies generated error. This belief that we could address
real-world manipulation with manual physics models resembles early ML's attempts at manual
feature engineering — and just as those were replaced by deep learning, the same has
occurred in robotics.

**Breakthrough #2: Deep reinforcement learning.** In the early 2010s, deep reinforcement
learning exploded, showing better-than-human performance on
[Atari](https://arxiv.org/abs/1312.5602),
[Go](https://www.nature.com/articles/nature16961), and
[Dota 2](https://arxiv.org/abs/1912.06680). This mattered for robotics because **robotic
control is essentially a reinforcement learning problem**: the robot (agent) learns to take
actions (control its actuators) to maximize reward (executing planned actions).

Applying RL to robotics required handling continuous configuration spaces and long-horizon
credit assignment. Algorithms like [TRPO](https://arxiv.org/pdf/1502.05477) and
[PPO](https://arxiv.org/abs/1707.06347) provided good training convergence in continuous
environments, and more sample-efficient algorithms like
[DDPG](https://arxiv.org/pdf/1509.02971) and [SAC](https://arxiv.org/pdf/1801.01290) made it
feasible to train on real-world robots where data collection is expensive.

**Breakthrough #3: Simulation.** Progress in deep RL for robotics was also driven by
improved simulation software. Training in simulation offers parallelization and scale far
beyond reality. In 2012,
[MuJoCo](https://homes.cs.washington.edu/~todorov/papers/TodorovIROS12.pdf) provided an
open-source simulator built specifically for robotics, with accurate contact and rigid body
dynamics. **Most breakthrough simulation research in robotics afterward has been conducted
in MuJoCo.**

Training in simulation comes with the challenge of transferring policies to reality — the
**sim-to-real problem**. RL policies often learn to exploit simulator inaccuracies, then
fall apart under real physics. This was addressed with
[Domain Randomization](https://arxiv.org/pdf/1703.06907),
[Dynamics Randomization](https://arxiv.org/pdf/1710.06537), and
[Simulation Optimization](https://arxiv.org/pdf/1810.05687), where policies are trained with
randomized textures, lighting, and physics so they generalize to reality as just another
variation.

These advancements were combined in
[OpenAI's robotic hand](https://arxiv.org/pdf/1808.00177), trained entirely in MuJoCo and
demonstrating 5-finger dexterous manipulation of a block. This sim-first approach to
*gross-body* control remains powerful today: Unitree's G1 learned a standing side-flip
purely in simulation and transferred it zero-shot to hardware, and Boston Dynamics'
electric Atlas learned whole-body behaviors from
[~150 million simulator runs](https://rai-inst.com/resources/blog/rai-institute-2025-a-year-of-innovation-for-robotics-and-ai/)
transferred zero-shot to the real robot. Where simulation still struggles is fine,
contact-rich finger manipulation — exactly the part Moravec's paradox predicts is hardest.

**Breakthrough #4: End-to-end learning.** Initially, deep-learning control systems trained
their vision and motor components separately, restricting the flow of information between
perception and control. With the introduction of
[end-to-end visuomotor policies](https://arxiv.org/pdf/1504.00702), roboticists started to
jointly train vision and motor control with a single objective, letting the network tune the
information flow itself.

This approach was validated by [BC-Z](https://arxiv.org/pdf/2202.02005), which used
end-to-end training to achieve state-of-the-art results with a robot that could generalize
to unseen tasks. Modern robotic systems are all built this way now, reflecting a broader
trend toward training increasingly end-to-end systems.

**Breakthrough #5: Tele-operation and imitation learning.** As we made progress with deep RL
in simulation, it became clear that to achieve certain types of generalization (to new
objects and environments), we would need real-world data — because constructing a simulation
as complex as reality is intractable.

This motivated imitation learning, where demonstrations are collected from humans operating
real-world robots (tele-operation), and deep learning policies learn to imitate them. Early
approaches like
[Behavior Cloning](https://proceedings.neurips.cc/paper/1988/file/812b4ba287f5ee0bc9d43bbf5bbe87fb-Paper.pdf),
[Inverse Reinforcement Learning (IRL)](https://ai.stanford.edu/~ang/papers/icml04-apprentice.pdf),
and [GAIL](https://arxiv.org/pdf/1606.03476) assumed human demonstrations were optimal
policies. [DAgger](https://arxiv.org/pdf/1011.0686) helped augment the dataset to recover
from unseen scenarios. Then [BC-Z](https://arxiv.org/pdf/2202.02005) showed that training
control policies from tele-operation via imitation learning could be effective.

The development of [ALOHA](https://arxiv.org/pdf/2304.13705), a low-cost hardware system for
tele-operation, set a standard for relatively cheaply collected real-world robotic data —
and tele-operation remains the dominant source of robot training data today.

**Breakthrough #6: Robotic transformers.** Recent progress in LLMs with the transformer
architecture motivated the use of transformers and internet-scale data in robotics.
[RT-1](https://arxiv.org/pdf/2212.06817) showed that a transformer trained on image, text,
and robotic control data could achieve state-of-the-art results. Then
[SayCan](https://arxiv.org/pdf/2204.01691) and [RT-2](https://arxiv.org/pdf/2307.15818)
showed that multi-modal VLMs could be fine-tuned for robotic planning and control —
mirroring the pre-training/fine-tuning paradigm of early LLMs. RT-2 introduced the
**vision-language-action (VLA)** model paradigm.

Then the [Action Chunking Transformer (ACT)](https://arxiv.org/pdf/2304.13705) allowed
control policies to predict a series of actions over multiple time-steps rather than a
single action, allowing for much smoother and coordinated actuator control.

**It's hard to overestimate how much value VLMs have brought to robotic planning and
reasoning capabilities; this has been a major unlock on the path toward general-purpose
robotics.**

**Breakthrough #7: Cross-embodiment.**
[Physical Intelligence's](https://www.physicalintelligence.company/) first robotics
foundation model [π0](https://www.physicalintelligence.company/download/pi0.pdf) introduced
a set of impressive architectural and training innovations: a pretrained VLM backbone
(PaliGemma) coupled to a **flow-matching action expert**, trained on a **cross-embodiment
dataset** spanning many different robot hardware systems.

This represented an impressive form of generalization, presenting the prospect of a single
**robotic foundation model** that works across hardware architectures. Cross-embodiment may
actually improve control by allowing the model to isolate world-model dynamics from the
specifics of any one robot.

**Breakthrough #8: Open foundation models and a converged recipe.** A striking property of
the current frontier is that the *architecture question is essentially settled*. Physical
Intelligence open-sourced [π0 and π0-FAST](https://www.pi.website/blog/openpi), and π0-FAST
introduced **FAST** — a frequency-space (DCT-based) action tokenizer — that lets an
autoregressive transformer emit action tokens and
[train ~5× faster](https://arxiv.org/abs/2501.09747) for comparable dexterity.

Crucially, large gains came from *recipe*, not new architecture.
[OpenVLA-OFT](https://arxiv.org/abs/2502.19645) lifted a standard manipulation benchmark
from **76.5% → 97.1%** with 26× higher throughput using only parallel decoding, action
chunking, and an L1 regression objective. And
[SmolVLA](https://huggingface.co/blog/smolvla) — a 450M-parameter model trained on ~23,000
community trajectories — reached **78.3%** real-world success on cheap consumer arms.

> The lesson is that essentially everyone now ships the same template: a **pretrained VLM
> backbone + an action expert (flow-matching or tokenized) + action chunking.** Progress
> comes from how you feed and refine that template, not from reinventing it. As we'll see,
> this is why **data, not architecture, is the binding constraint.**

**Breakthrough #9: Dual-system "think slow, act fast".** A single VLM is too slow (~5–10 Hz)
for the reactive control loop a humanoid needs (~100–200 Hz), but a fast policy alone has no
semantic understanding. The field converged on a **System-2 / System-1** decomposition — an
explicit engineering analogue of Kahneman's "thinking fast and slow":

- [**Figure Helix**](https://www.figure.ai/news/helix): a 7B-parameter VLM "S2" running at 7–9 Hz paired with an 80M visuomotor policy "S1" running at **200 Hz**, controlling a 35-DOF upper body *entirely on-board*, trained on only ~500 hours of teleoperation.
- [**NVIDIA GR00T N1**](https://arxiv.org/abs/2503.14734): a 2.2B open-weight dual-system model (a 1.34B Eagle-2 VLM + a 0.86B diffusion transformer running at ~120 Hz).
- [**Gemini Robotics**](https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/): a VLA paired with a separate embodied-reasoning model, with an [on-device variant](https://deepmind.google/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/) that adapts to a new task with as few as 50–100 demonstrations.

That three independent frontier labs converged on the *same* decomposition is itself strong
evidence the architecture is a solved quantity.

**Breakthrough #10: Co-training and open-world generalization.** The most important
*measured* control result is [**π0.5**](https://www.pi.website/blog/pi05)
([paper](https://arxiv.org/abs/2504.16054)). It is co-trained on a heterogeneous mixture —
~400 hours of mobile-manipulator data across **~104 distinct homes**, plus web data,
cross-embodiment lab data, and a high-level *semantic subtask* prediction objective (the
model first predicts what subtask to do in language, then produces low-level actions). The
result is a mobile robot that **cleans kitchens and bedrooms in entirely new homes it never
saw in training.**

The deeper finding is the scaling behavior: π0.5's out-of-distribution performance
**approaches in-distribution performance after only ~104 training environments.**
Generalization is driven by the **diversity** of environments and objects, not by the raw
volume of demonstrations — a result corroborated by a
[published manipulation scaling law](https://arxiv.org/abs/2410.18647) showing
demonstrations-per-setting saturate around 50. This reshapes the entire data question.

**Breakthrough #11: Knowledge insulation.** Fine-tuning a VLM on robot actions tends to
*degrade the VLM's web knowledge* — a form of catastrophic forgetting in which the
action-fine-tuned model loses ground on the world knowledge and reasoning its backbone
started with. The fix is to protect the backbone:
[**π0.6**](https://website.pi-asset.com/pi06star/PI06_model_card.pdf) (Gemma3-4B backbone +
~860M action expert) introduced **Knowledge Insulation**, where the gradient from the action
expert does *not* flow back into the VLM.
[GR00T N1.5](https://research.nvidia.com/labs/gear/gr00t-n1_5/) did the analogous thing —
froze the VLM and added a latent-alignment loss — lifting real-robot language-following from
**46.6% → 93.3%** and overall success from **43.3% → 83.0%.** The payoff is out-of-the-box
competence: π0.6 folds laundry and buses tables with no task-specific fine-tuning.

**Breakthrough #12: Real-world reinforcement learning.** Imitation learning has a hard
ceiling: you cannot imitate your way past the quality of your teleoperators.
[**π\*0.6 with RECAP**](https://arxiv.org/abs/2511.14759) (*RL with Experience & Corrections
via Advantage-conditioned Policies*) breaks that ceiling by combining demonstrations,
on-policy autonomous practice, and expert teleoperated interventions under an
advantage-conditioned objective. On the hardest tasks it **more than doubles throughput and
roughly halves failure rates** (espresso failure ~40% → ~10%; laundry ~50% → ~25%). It was
demonstrated in endurance settings that look like real work — an espresso station run from
5:30am to 11:30pm at >90% success, and 59 boxes assembled and labeled in a real
chocolate-packaging factory. Importantly, this improves the *reliability of known skills*;
it does not create new ones.

**Breakthrough #13: Synthetic data and world-model bootstrapping.** Real robot data is
rate-limited — a robot can only generate ~24 robot-hours of data per day.
[NVIDIA's DreamGen](https://arxiv.org/abs/2505.12705) attacks this by fine-tuning a video
world model on pick-and-place data, then using it to hallucinate synthetic "neural
trajectories" for new behaviors. This taught a real humanoid **22 genuinely new verbs** at
43.2% (seen environments) / 28.5% (unseen) — versus 0% for the baseline. It is the single
most credible signal of *new-skill* acquisition in robotics today, and notably it comes from
synthetic data rather than real-data scale. It is also a single-lab result that is not yet
independently reproduced, and it depends on a world model — which, as we'll see, still does
not reliably grasp physics.

> **Capabilities & Limitations: Control**
>
> - There is an open, convergent VLA recipe; dual-system on-board inference; co-training to unseen environments; knowledge-insulated training; and real-world RL that pushes known-skill reliability past 90% on narrow tasks.
> - Reliability on *known* skills is climbing fast.
> - Every marquee "fully autonomous" deployment claim is **company-asserted, not third-party-audited**.
> - **New motor-skill formation from real data alone remains unshown.** The one new-skill signal is synthetic-data-driven, single-lab, and low-percentage.

### 2.3 Generalization

Now that we've covered the innovations that have led us to the current frontier of
robotics, we can evaluate the capabilities of state-of-the-art robots to see how far they
generalize and how much farther we will have to go before we achieve general-purpose
robots.

Despite all the variety of approaches over the past three decades, the frontier has
converged to a relatively straightforward approach built around end-to-end training of a
VLM backbone + action expert, with internet-scale pre-training and manually-collected
tele-operation data, refined with co-training and real-world RL.
[π0.5](https://arxiv.org/abs/2504.16054), [GR00T](https://arxiv.org/abs/2503.14734),
[Gemini Robotics](https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/),
[Helix](https://www.figure.ai/news/helix), and China's
[GO-1](https://github.com/OpenDriveLab/AgiBot-World) are all variations on this theme.

These models demonstrate the following generalization capabilities:

1. **Objects** — VLAs recognize and handle a wide variety of objects, including ones never seen in training. Figure's Helix claims zero-shot grasping of thousands of novel household objects.
2. **Environments** — VLAs operate in diverse environments. π0.5's headline result is cleaning *unseen homes*.
3. **Instructions** — VLAs follow novel phrasings and object combinations (e.g. "wipe the spill with the bread") — applying a *known* skill to a new instruction.
4. **Reasoning** — High-level reasoning is close to solved, with VLMs providing sufficient problem-solving for most real-world tasks.
5. **Hardware** — Cross-embodiment results indicate it's possible to build foundation models that operate across hardware, though the hardest tasks still ship on simple grippers, and 5-finger generalization remains far less mature.
6. **Manipulation skills** — Robots are still far from being able to manipulate most objects with arbitrary new skills. They have demonstrated the ability to *generalize known skills* to new objects, instructions, and environments, but with little evidence of acquiring genuinely new manipulation skills from data.

**Robotic manipulation reliability — and especially the formation of new manipulation
skills — is by far the largest barrier to progress right now** in terms of how far behind it
is compared with the other functions.

This is made unmistakable by the honest, standardized benchmarks that now exist to measure
it:

> **The benchmarks expose how shallow current generalization really is:**
>
> - [**RoboChallenge / Table30**](https://arxiv.org/abs/2510.17950), the largest standardized real-robot benchmark to date: the best published VLA (π0.5, task-specific fine-tune) averages only **43.7%** across 30 tasks.
> - [**BEHAVIOR Challenge**](https://behavior.stanford.edu/): the winning entry scored just **12.4%** on 50 long-horizon household tasks — *with* 10,000 teleop demonstrations provided.
> - [**LIBERO-Plus**](https://arxiv.org/abs/2510.13626): state-of-the-art success *collapses* under mild perturbation — π0 falls **94.2% → 6.6%** under a shift in the robot's initial state, and **→ 15.8%** under a camera-viewpoint shift. The models are largely **memorizing object locations**, not understanding.
> - [**Robust Skills, Brittle Grounding**](https://arxiv.org/abs/2602.24143): for models like π0.5, motor-primitive *execution* is far more reliable than instruction-conditioned task success — the wall is grounding and contact reliability, not the motor program.

> It is essential to separate three different things that all get called "generalization":
>
> 1. **Object / instruction generalization** of a known skill (grasp a *new* object; wipe a *new* thing) — real and rising.
> 2. **Environment generalization** of a known skill (clean an *unseen* home) — real; this is π0.5's achievement.
> 3. **New-motor-skill formation** (acquiring a manipulation *verb* absent from training, from data scale alone) — **still not demonstrated** on reproducible evidence. The strongest counter-signal (DreamGen's 22 new verbs) came from synthetic video at 28–43% success, not from real-data scale.

> **State-of-the-art capabilities.** Current robotic capabilities have gotten to the point
> where we can:
>
> 1. Manually collect a dataset for specific tasks and fine-tune a VLA to complete them with rising reliability, and now generalize those tasks to **unseen objects, instructions, and even unseen homes**.
> 2. Use real-world RL to push a *known* skill's reliability past **90%** on narrow tasks (espresso, box-packing) — on gripper hardware, in controlled settings.
> 3. But on honest, perturbed, long-horizon benchmarks, the best public systems sit at **12–44%**.
>
> Note that we are still far from generalization to new manipulation skills, with the only
> credible signal coming from synthetic data, single-lab, and at low success rates.

> Robotic perception and locomotion are now mature and somewhat separate from manipulation.
> Locomotion in particular is close to a solved engineering problem — Unitree's
> [H1 sprinted at 10 m/s](https://www.humanoidsdaily.com/news/unitree-h1-reclaims-speed-record-with-blistering-10-m-s-sprint),
> humanoids recover from falls on grass and ice, and sim-to-real locomotion can be trained
> in ~15 minutes on a single GPU. The remaining wall is entirely in the hands.

---

## 3. Future

With this context, we can now try to understand how the robotics industry will develop from
here.

Billions of dollars of capital have been deployed across
[Tesla Optimus](https://www.tesla.com/we-robot), [Figure](https://www.figure.ai/),
[1X](https://www.1x.tech/),
[Physical Intelligence](https://www.physicalintelligence.company/),
[Skild](https://www.skild.ai/), and a wave of Chinese companies to achieve the promise of
general-purpose robotics.

In this section, we'll look at how this arms race will play out by answering the following
questions:

- What is the current technical barrier to developing general-purpose robotics?
- How will we overcome this technical barrier?
- What business strategy is required to accomplish this?
- How long will it take to achieve this?
- Who is most likely to win the general-purpose robotics arms race?

### 3.1 Constraints

We have seen that current capabilities leave much to be desired in the way of
general-purpose robotics.

The best robots today can pick up new tasks given manually collected task-specific datasets,
and can now generalize those tasks to new objects and even new environments — but they are
far from executing arbitrary tasks on demand due to insufficient and unreliable manipulation
ability.

**In order to justify the valuations and capital being poured into humanoid robotics today,
they need to get to a point where they can generalize to new tasks and environments with
full autonomy.**

Creating a fully autonomous and general-purpose robot is now a deep learning problem, so we
can turn to the 7 constraints of deep learning progress to evaluate what the current
limiting constraint is.

> There are 7 simple constraints that limit the intelligence of deep learning systems:
> data, parameters, optimization and regularization, architecture, compute, compute
> efficiency, and energy.

**Compute**, **compute efficiency**, **parameters**, **energy**, and **optimization &
regularization** have all been pushed forward by the broader deep learning industry and are
not the binding constraints for robotics.

**Architecture** is, by now, also a solved-enough constraint: the convergent VLA + action-
expert + action-chunking recipe is universal, and the gains of recent years came entirely
from data composition, co-training, knowledge insulation, and reinforcement learning —
*training-recipe* changes, not architectural reinvention. A 450M-parameter model can do real
manipulation, so scale isn't the gate either.

> With the right data, current state-of-the-art architectures already display impressive
> generalization to new objects, instructions, and environments.
>
> We have yet to train a robotics model on data anywhere near the diversity and scale that
> would be required for reliable, fully-general manipulation.
>
> **So data is the current constraint limiting progress in robotics** — though, as we'll
> see, it's the *kind* of data that matters, not merely the raw quantity.

With this in mind, let's take a look at what needs to happen to overcome this data
constraint.

### 3.2 Data Scale

Scaling laws from deep learning tell us that **given sufficient data, we can scale up
parameters and use more compute to get much better models with impressive generalization
capabilities.**

With LLMs, we could instantly start training larger models, because we had **internet scale
data available to train on**. We don't have this for robotics. Robots require data collected
from sufficiently similar hardware, so old data is hard to repurpose, and new datasets must
be created manually.

How much data does it take, and of what kind? It's instructive to look at the scale of the
datasets behind today's models:

| Model / Dataset | Org | Date | Scale | Key reported result |
|---|---|---|---|---|
| BC-Z | Google | 2022 | 25,877 demos / 125 hrs / 100 tasks | zero-shot to unseen tasks |
| RT-1 | Google | 2022 | ~130k episodes / 700+ tasks / 13 robots | transformer at scale |
| ACT / ALOHA | Stanford | 2023 | ~50 demos/task, bimanual | introduced action chunking |
| π0 | Physical Intelligence | 2024 | >10,000 hrs cross-embodiment | open-sourced; FAST tokenizer ~5× faster |
| π0.5 | Physical Intelligence | 2025 | ~400 hrs mobile-manip across **104 homes** + web | cleans *unseen* homes; OOD → ID after ~104 envs |
| π\*0.6 (RECAP) | Physical Intelligence | 2025 | + real-world RL | >2× throughput, ~½ failure on hardest tasks |
| GR00T N1 / N1.5 | NVIDIA | 2025 | ~50k H100-hrs; web + synthetic + real | open weights; real-robot success 43% → 83% |
| AgiBot World (GO-1) | AgiBot / Zhiyuan | 2025 | **1,003,672 trajectories / 2,976 hrs / 217 tasks** | largest open real corpus; **~43.8T tokens** |
| Helix | Figure | 2025 | ~500 hrs teleop | zero-shot grasp of "thousands" of objects |
| SmolVLA | Hugging Face | 2025 | ~23k community trajectories / 450M params | 78.3% real-world on consumer arms |

> **It is the diversity of data, not the raw token count, that binds.**
>
> The largest *open* real-robot corpus, AgiBot World, is roughly **43.8 trillion tokens** —
> and it already supports strong *known-skill* generalization. Meanwhile the dominant
> [published manipulation scaling law](https://arxiv.org/abs/2410.18647) shows
> generalization scales with the **diversity** of environments and objects, with
> demonstrations-per-setting saturating around **50**. π0.5 reaches ~94% out-of-distribution
> success after only **~104 environments**, and SmolVLA hits 78% with just ~23,000
> trajectories. Piling more demonstrations into the same few environments adds little;
> spreading the same budget across many environments generalizes. The binding axis is
> **diversity × quality × reinforcement learning**, not sheer volume.

> There is one crucial caveat. That scaling law measures generalization of *known* skills to
> new objects and environments — it explicitly does **not** measure *new-skill*
> generalization, which its authors note "would require collecting vast amounts of data from
> thousands of tasks." For the regime that matters most — a robot acquiring a genuinely new
> manipulation skill — *no public scaling curve exists at any size*. So while reliable
> known-skill generalization is now clearly achievable with tens of trillions of diverse,
> high-quality tokens plus RL, the data budget for **new-skill emergence is unmeasured** and
> remains the central open question. Models scaling toward ~1M hours of data (like
> Generalist's [GEN-θ](https://generalistai.com/)) are the closest thing to a live test of
> whether brute scale eventually produces new skills.

Everyone in the robotics industry understands that data is the bottleneck. So the question
is: how do we generate diverse, high-signal data at scale?

### 3.3 Data Collection

There are three paths to the scale and diversity of data we need: repurpose internet data,
train in simulation, or collect real-world tele-operation data. Let's look at each.

**1. Repurposing internet data.** The natural concern with internet video is that it lacks
the correct camera angles and matching proprioceptive/sensor data, so intuitively it should
only help with pre-training. That concern is largely correct for *generic* internet video —
but **embodiment-matched human video helps a great deal** when used for co-training.

[EgoMimic](https://arxiv.org/abs/2410.24221) co-trains a robot policy on egocentric human
video (captured from glasses, with the viewpoint matched to the robot's) plus robot demos,
and boosts success by **34–228%**, finding that "1 hour of human data > 1 hour of robot
data." Apple released
[EgoDex](https://machinelearning.apple.com/research/egodex-learning-dexterous-manipulation),
829 hours of egocentric video with finger-level 3D tracking. The catch is that the benefit
requires triangulated 3D hand pose and **shrinks toward zero as robot data scales up**: human
video is a powerful *bootstrap* in the low-data regime, not a replacement for robot data.
Generic, un-matched internet video (e.g. Ego4D) remains useful mainly for perception
pre-training.

**2. Simulation.** Training in simulation offers near-unlimited scale and reproducibility.
The picture splits cleanly into two halves.

> **Generative world models still do not reliably grasp physics.** On Meta's
> [IntPhys 2](https://arxiv.org/abs/2506.09849) intuitive-physics benchmark, the best model
> scores ~57% (near chance) versus ~96% for humans. When
> [world-model-generated videos are executed on real robots](https://arxiv.org/abs/2601.04137),
> success ranges only 8–41% — "visual realism alone is insufficient for embodied execution."
> Even NVIDIA's own [Cosmos](https://www.nvidia.com/en-us/ai/cosmos/) materials acknowledge
> physics violations, and the much-hyped
> [Genesis simulator's "43M FPS" claim](https://stoneztao.substack.com/p/the-new-hyped-genesis-simulator-is)
> was independently measured at ~0.29M FPS.

> **But classical physics-engine sim-to-real now works on narrow primitives.**
> [DexSim2Real](https://arxiv.org/abs/2605.05241) reports 78.2% average real success across 6
> tasks with only an 8.3% sim-to-real gap, and Boston Dynamics' Atlas learned whole-body
> skills from ~150M sim runs transferred zero-shot to hardware. Simulation reliably delivers
> gross-body locomotion and some narrow manipulation; it does not yet deliver the rich,
> contact-rich diversity needed for general manipulation, and generative world models that
> might supply that diversity don't yet model physics well enough.

**3. Real-world data.** Given the need to train on the rich complexity and diversity of the
real world, **real-world tele-operation remains the backbone of robot data collection.**

This is why nearly every robotics company today has started with a tele-operation or
task-specific autonomy approach to build its dataset. The largest open dataset in the world
— [AgiBot World](https://github.com/OpenDriveLab/AgiBot-World), over a million trajectories
— is 100% VR + motion-capture tele-operation. China has stood up
[40+ state-backed tele-operation "data factories"](https://restofworld.org/2026/china-robots-training-centers-workers/)
paying operators ~$3/hour specifically to generate this data.

> Tele-operation is no longer the *only* path, though it remains the foundation. Two newer
> sources now supplement it:
>
> - **Real-world reinforcement learning** ([RECAP](https://arxiv.org/abs/2511.14759)), which lets a robot improve past its teleoperators by practicing autonomously.
> - **Synthetic data** from video world models ([DreamGen](https://arxiv.org/abs/2505.12705)), which can amplify a small real seed into hundreds of thousands of trajectories.
>
> The deepest historical lesson still holds: the internet-scale datasets behind frontier LLMs
> were created by **network effects** over decades, generating trillions of dollars of value
> along the way. We are trying to manually fund the creation of a comparable dataset for
> robotics. For this to work, deployed robots need to be revenue-generating, or the company
> needs a continuous stream of capital.

**Selecting the right strategy to get enough data is critical.** Let's understand what needs
to happen.

### 3.4 The Winning Strategy

To collect the necessary scale and diversity of data, we need fleets of robots deployed in
the real world, operating across many tasks and collecting high-signal data over long
horizons. It's unlikely this is sustainable if it requires perpetually paying for data with
venture capital, so **picking the right market and problem to start with is essential.**

**Labor arbitrage and data signal.** To sustainably collect data, robots need to be
performing tasks that are useful today. One path is **labor arbitrage** with tele-operation,
where cheaper remote labor is used to justify deployments. But the data must actually have
enough *signal* to enable general-purpose robotics — deploying robots into a factory to do
the same task repeatedly in a controlled environment produces little data useful for
generalization. A decade ago, a wave of industrial-automation companies tried the "start
with a niche task and generalize later" thesis; most failed to collect data diverse enough
to generalize, and failed altogether.

So we need **high-quality deployments**: deployments with sufficient variance in the
collected data. There are a few viable strategies:

1. **Consumer robotics** could collect data from the variety of tasks and configurations in the home.
2. **Robotics in the outside world** could collect varied data, but economically valuable use cases are scarce.
3. **Humanoids for industrial and commercial automation**.

**Consumers, and where the real deployments are.** Consumer robotics would be excellent for
diverse data — but **deploying robots in the home requires the highest safety constraints,
the lowest tolerance for error, and tele-operation that few consumers will want in their
living spaces.** This is why I expect autonomous consumer humanoids to be the *last* use
case, not the first.

> [1X has opened consumer pre-orders for its NEO home humanoid](https://www.therobotreport.com/1x-announces-pre-order-launch-neo-humanoid-robot/)
> ($20,000 or $499/month, with deliveries in 2026), which looks like a consumer-first move.
> But 1X's CEO has
> [confirmed](https://techcrunch.com/2025/12/11/1x-struck-a-deal-to-send-its-home-humanoids-to-factories-and-warehouses/)
> that the home NEO relies on **scheduled human tele-operators** (who can see into the home)
> for tasks it can't do autonomously — and that 1X is simultaneously redirecting "home" units
> to factories and warehouses. So the *commercial offering* is consumer-facing, but the
> *autonomous capability* is not there yet. The deployments with the most verified operating
> hours are all industrial.

The most documented real deployments confirm where the value is today:

| Company | Partner | What's verified |
|---|---|---|
| Figure | BMW (Spartanburg) | one robot, ~1,250 hrs over ~11 months, ~90,000 parts, single task; then retired ([source](https://www.figure.ai/news/production-at-bmw)) |
| Agility Robotics (Digit) | GXO | moved [100,000+ totes](https://www.geekwire.com/2026/digit-maker-agility-robotics-to-go-public-in-2-5b-deal-heres-what-the-filings-say-about-its-finances/); RaaS priced at ~$30/hr, ~$250k/unit |
| Apptronik (Apollo) | Mercedes-Benz, GXO, Jabil | supervised manufacturing pilots |
| Tesla Optimus | Tesla factories (captive) | a few hundred units; [Musk says they do "primarily learning, not productive tasks"](https://electrek.co/2026/04/22/tesla-optimus-production-fremont-model-sx-line/) |

> It makes the most sense to keep training robots for individual industrial and commercial
> tasks, channeling this data to improve autonomy and earn more deployments, until the
> diversity of observed tasks and environments provides enough signal for broad
> generalization. This is the strategy Optimus, Figure, Apptronik, and Agility have all
> converged on.

**What will it take?** This process will be slow and very capital-intensive. It requires
constructing entire hardware supply chains and manufacturing processes, collecting large
amounts of diverse data, and likely burning capital for a long time (plausibly more than
5–10 years) before truly general autonomous robots are ready.

Given this, the path requires either the backing of a large revenue generator, or a
continuous stream of patient capital. There are now two distinct ways companies are securing
it.

**The Western model — mega-rounds and captive revenue.** Capital has flowed in at
extraordinary scale, and notably, the leading independents have raised enough to *stay*
independent rather than being absorbed:

| Company | Valuation | Source |
|---|---|---|
| Figure AI | $39B post-money | [PR](https://www.prnewswire.com/news-releases/figure-exceeds-1b-in-series-c-funding-at-39b-post-money-valuation-302556936.html) |
| Skild AI | >$14B | [Skild](https://www.skild.ai/blogs/series-c) |
| Physical Intelligence | $5.6B | [Bloomberg](https://www.bloomberg.com/news/articles/2025-11-20/robotics-startup-physical-intelligence-valued-at-5-6-billion-in-new-funding) |
| Apptronik | ~$5B | [Crunchbase](https://news.crunchbase.com/venture/ai-humanoid-robot-funding-apptronik/) |
| Agility Robotics | $2.5B (via SPAC) | [GeekWire](https://www.geekwire.com/2026/digit-maker-agility-robotics-to-go-public-in-2-5b-deal-heres-what-the-filings-say-about-its-finances/) |

NVIDIA, Intel, Qualcomm, Microsoft, and others hold *minority strategic* stakes in these
companies, but have not acquired them; Agility chose a public-market exit via SPAC. The
capital markets have, for now, given the strongest challengers enough runway to remain
independent.

> **The China model — state capital substitutes for captive revenue.** This is the most
> important structural development in the industry, and it changes the strategic logic
> entirely. China is winning the early *hardware* and *data-volume* race: the largest
> humanoid shippers in the world are Chinese,
> [Unitree](https://www.therobotreport.com/unitree-ipo-shows-a-real-hardware-business-the-humanoid-case-is-still-early/)
> shipped thousands of units and filed a profitable-hardware-business IPO, and
> [AgiBot](https://github.com/OpenDriveLab/AgiBot-World) built the largest open dataset in
> existence. The flywheel runs on subsidized tele-operation, deployment is underwritten by
> tens of billions of dollars in city and national funds, and embodied intelligence is named
> a strategic priority in the national five-year plan. Because the state acts as the capital
> backstop, a Chinese player with no profits can outlast a VC-funded Western peer — which
> **breaks the "only incumbents with captive revenue survive" logic.** The matched-skepticism
> caveat: Chinese *unit counts are not deployed-and-working counts* (Unitree's own prospectus
> shows ~74% of humanoid revenue is research/education, ~9% industrial), and "industrial
> autonomy" claims are vendor marketing with no third-party audit.

**Who wins?** The case that **Tesla wins** rests on real structural advantages: Tesla is
fundamentally a robotics company, with proprietary perception/planning, custom inference
chips, deep manufacturing and supply-chain expertise, ~20 years of organizational competence
on exactly this kind of hard engineering problem, and — uniquely — a captive revenue stream
from its vehicle business that can fund a long, expensive robotics program indefinitely. As
humanoid timelines extend, that captive revenue is a genuine moat that pure-play startups
lack.

But the case is more contested than it looks. Tesla's execution has stumbled badly: it
[missed its 2025 production target by more than 90%](https://electrek.co/2026/04/22/tesla-optimus-production-fremont-model-sx-line/),
Musk has acknowledged the deployed units do "primarily learning, not productive tasks," the
[dexterous hand was redesigned more than once](https://www.basenor.com/blogs/news/tesla-optimus-gen-3-hand-patents-revealed-25-actuators-22-dof)
(including after the public patent), and the
[head of the Optimus program departed](https://cleantechnica.com/2025/06/09/milan-kovac-head-of-tesla-optimus-program-departs/).
Meanwhile, well-funded independents are racing ahead on the software frontier, and China is
running a parallel, state-funded ladder that doesn't require a single "winner" at all.

> **Outlook on general-purpose robotics.** Putting this together, the realistic outlook is:
>
> - **Locomotion and perception are solved.** They are no longer the story.
> - **Reliable known-skill manipulation in semi-structured commercial settings is roughly 2–4 years away** — this is now an engineering grind (more diverse data + real-world RL), not a research mystery.
> - **General, new-skill, dexterous manipulation in open environments is still 5–10+ years away**, gated on a research breakthrough (or brute synthetic-data scale) that has not yet happened. Tesla's stumbles are the clearest evidence that the hard half is measured in years, not quarters.
>
> The most sensible strategy is to deploy some form of general-purpose robotics into
> economically valuable industrial and commercial use cases, use tele-operation and
> supervised autonomy to make task-specific robots useful, and slowly collect high-signal,
> diverse data to build toward broad autonomy. Companies pursuing this will be capital-hungry
> for a long time, and will rely on patient capital, captive revenue, or — in China — the
> state.
>
> The race is no longer a coronation. Tesla retains the strongest structural hand in the West
> but is no longer a sure thing; Physical Intelligence is the frontier of the *brain*;
> Figure, Apptronik, and Agility are credible; and the Chinese ecosystem may matter most of
> all. The safest prediction is that the next several years belong to whoever can compound a
> **diverse data flywheel** on **stable hardware** with **patient capital** — and that this
> will take longer than the demos suggest.

---

## 4. Reflections

This section is for a few interesting tangents that didn't fit into the main narrative. It
can be treated as an appendix.

### 4.1 Secrecy

The deep learning industry progressed almost entirely in public through published research
up until a few years ago, when labs started to privatize research. Robotics has developed
almost entirely in secrecy for decades — companies like
[Boston Dynamics](https://bostondynamics.com/) and many Chinese firms have achieved
impressive results with no published paper trail.

This makes it difficult to infer where the true state-of-the-art is. The handful of groups
that publish openly — Physical Intelligence, NVIDIA's GR00T, AgiBot World — let us make
educated guesses, but their public results are a **lower bound** on what's possible.

> The secrecy problem is, if anything, more acute now because of marketing. Nearly every
> headline autonomy and deployment claim rests on **company assertion with no third-party
> audit**: Figure's "8-hour autonomous shifts," Tesla's demos (several of which were quietly
> tele-operated), 1X's home autonomy, Boston Dynamics/TRI's "single network generalizes"
> claims. The one genuinely healthy countertrend is the rise of **independent, adversarial
> evaluation** — distributed real-robot comparisons like
> [RoboArena](https://arxiv.org/abs/2506.18123), robustness audits like
> [LIBERO-Plus](https://arxiv.org/abs/2510.13626), and standardized benchmarks like
> [BEHAVIOR](https://behavior.stanford.edu/) — which consistently show capability far below
> the marketing. The public frontier is a lower bound on capability and, for autonomy claims,
> an upper bound on honesty.

### 4.2 Nature's Engineering

Studying robotics gives grounds for a new appreciation of the complexity of the real world
and the impressive capabilities of human motor control. It highlights the fact that the
human body and brain are really a solution to the exact same reinforcement learning problem
that robots are trying to solve: **goal-oriented action in the real world.**

Our software and hardware were optimized by natural selection. A similar process is
occurring in robotics research, where the selection criteria of good research filter out our
pre-conceived notions about nicely organized symbolic systems and reveal what actually
works. And in this process, **we are starting to see that the correct approach to robotics
is quickly converging closer to re-engineering the human brain.**

We've moved toward a single end-to-end system, optimized together, with different components
offering different inductive biases for sub-problems within perception, planning, and
control. We've adopted curiosity-based learning and the pre-train/fine-tune paradigm. And
recent advances make the analogy even more literal: the **dual-system (S1/S2) architecture**
is an explicit nod to fast and slow cognition, and **knowledge insulation** is, in effect, an
engineering analogue of protecting semantic memory from motor learning. Tellingly, the part
the field keeps stubbing its toe on — fine motor control of the hands — is exactly the part
the cortical homunculus tells us is the hardest.

**As we get closer to general-purpose humanoid robotics, we get closer to re-engineering the
entire human.**

---

## Papers

**Perception**

- **SLAM** — Simultaneous Localization and Mapping: Part I (2006), Hugh Durrant-Whyte and Tim Bailey. [PDF](https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=1638022)
- **SIFT** — Distinctive Image Features from Scale-Invariant Keypoints (2004), David G. Lowe. [PDF](https://www.cs.ubc.ca/~lowe/papers/ijcv04.pdf)
- **ORB** — ORB: an efficient alternative to SIFT or SURF (2011), Ethan Rublee et al.
- **ORB-SLAM** — ORB-SLAM: a Versatile and Accurate Monocular SLAM System (2015), Raul Mur-Artal et al. [PDF](https://arxiv.org/pdf/1502.00956)
- **DROID-SLAM** — DROID-SLAM: Deep Visual SLAM for Monocular, Stereo, and RGB-D Cameras (2021), Zachary Teed and Jia Deng. [PDF](https://arxiv.org/pdf/2108.10869)
- **VGGT** — Visual Geometry Grounded Transformer (2025, CVPR Best Paper), Meta AI. [Repo](https://github.com/facebookresearch/vggt)

**Planning**

- **A-star** — A Formal Basis for the Heuristic Determination of Minimum Cost Paths (1966), Peter E. Hart et al. [PDF](https://ai.stanford.edu/~nilsson/OnlinePubs-Nils/PublishedPapers/astar.pdf)
- **PRM** — Probabilistic Roadmaps for Path Planning in High-Dimensional Configuration Spaces (1996), Lydia E. Kavraki et al. [PDF](https://www.cs.cmu.edu/~motionplanning/papers/sbp_papers/PRM/prmbasic_01.pdf)
- **RRT** — Rapidly-Exploring Random Trees: A New Tool for Path Planning, Steven M. LaValle. [PDF](https://msl.cs.illinois.edu/~lavalle/papers/Lav98c.pdf)
- **CHOMP** — CHOMP: Gradient Optimization Techniques for Efficient Motion Planning (2009), Nathan Ratliff et al. [PDF](https://www.ri.cmu.edu/pub_files/2009/5/icra09-chomp.pdf)
- **TrajOpt** — Finding Locally Optimal, Collision-Free Trajectories with Sequential Convex Optimization (2013), John Schulman. [PDF](https://www.roboticsproceedings.org/rss09/p31.pdf)
- **STRIPS** — STRIPS: A New Approach to the Application of Theorem Proving to Problem Solving (1971), Richard E. Fikes and Nils J. Nilsson. [PDF](https://ai.stanford.edu/~nilsson/OnlinePubs-Nils/PublishedPapers/strips.pdf)
- **Max-Q** — Hierarchical Reinforcement Learning with the MAXQ Value Function Decomposition (1999), Thomas G. Dietterich. [PDF](https://arxiv.org/pdf/cs/9905014)
- **PDDL** — PDDL2.1: An Extension to PDDL for Expressing Temporal Planning Domains (2003), Maria Fox and Derek Long. [PDF](https://arxiv.org/pdf/1106.4561)
- **ASP** — What Is Answer Set Programming? (2008), Vladimir Lifschitz. [PDF](https://www.cs.utexas.edu/~vl/papers/wiasp.pdf)
- **Clingo** — Clingo = ASP + Control: Preliminary Report (2014), Martin Gebser et al. [PDF](https://arxiv.org/pdf/1405.3694)

**Classical Control**

- **Classical Control** — Modern Robotics: Mechanics, Planning, and Control (2019), Kevin M. Lynch and Frank C. Park.
- **Model Control** — Model learning for robot control: A survey (2011), Duy Nguyen-Tuong and Jan Peters. [PDF](https://www.researchgate.net/publication/51046423_Model_learning_for_robot_control_A_survey)

**Reinforcement Learning**

- **MDP** — Reinforcement Learning: A Survey (1996), Leslie Pack Kaelbling et al. [PDF](https://arxiv.org/pdf/cs/9605103)
- **Atari** — Playing Atari with Deep Reinforcement Learning (2013), Volodymyr Mnih et al. [PDF](https://arxiv.org/pdf/1312.5602)
- **A3C** — Asynchronous Methods for Deep Reinforcement Learning (2016), Volodymyr Mnih et al. [PDF](https://arxiv.org/pdf/1602.01783)
- **TRPO** — Trust Region Policy Optimization (2015), John Schulman et al. [PDF](https://arxiv.org/pdf/1502.05477)
- **GAE** — High-Dimensional Continuous Control Using Generalized Advantage Estimation (2015), John Schulman et al. [PDF](https://arxiv.org/pdf/1506.02438)
- **PPO** — Proximal Policy Optimization Algorithms (2016), John Schulman et al. [PDF](https://arxiv.org/abs/1707.06347)
- **DDPG** — Continuous control with deep reinforcement learning (2015), Timothy P. Lillicrap et al. [PDF](https://arxiv.org/pdf/1509.02971)
- **SAC** — Soft Actor-Critic (2018), Tuomas Haarnoja et al. [PDF](https://arxiv.org/pdf/1801.01290)
- **Curiosity** — Large-Scale Study of Curiosity-Driven Learning (2018), Yuri Burda et al. [PDF](https://arxiv.org/pdf/1808.04355)

**Simulation**

- **MuJoCo** — MuJoCo: A physics engine for model-based control (2012), Emanuel Todorov et al. [PDF](https://homes.cs.washington.edu/~todorov/papers/TodorovIROS12.pdf)
- **Domain Randomization** — Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World (2017), Josh Tobin et al. [PDF](https://arxiv.org/pdf/1703.06907)
- **Dynamics Randomization** — Sim-to-Real Transfer of Robotic Control with Dynamics Randomization (2017), Xue Bin Peng et al. [PDF](https://arxiv.org/pdf/1710.06537)
- **OpenAI Dexterous Manipulation** — Learning Dexterous In-Hand Manipulation (2018), Marcin Andrychowicz et al. [PDF](https://arxiv.org/pdf/1808.00177)
- **Simulation Optimization** — Closing the Sim-to-Real Loop (2018), Yevgen Chebotar et al. [PDF](https://arxiv.org/pdf/1810.05687)
- **Cosmos** — Cosmos World Foundation Model Platform for Physical AI (2025), NVIDIA. [Site](https://www.nvidia.com/en-us/ai/cosmos/)
- **IntPhys 2** — IntPhys 2: Benchmarking Intuitive Physics Understanding (2025), Meta FAIR. [PDF](https://arxiv.org/abs/2506.09849)

**Imitation Learning**

- **ALVINN** — ALVINN: An Autonomous Land Vehicle in a Neural Network (1988), Dean A. Pomerleau. [PDF](https://proceedings.neurips.cc/paper/1988/file/812b4ba287f5ee0bc9d43bbf5bbe87fb-Paper.pdf)
- **DAgger** — A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning (2010), Stephane Ross. [PDF](https://arxiv.org/pdf/1011.0686)
- **IRL** — Apprenticeship Learning via Inverse Reinforcement Learning (2012), Pieter Abbeel and Andrew Y. Ng. [PDF](https://ai.stanford.edu/~ang/papers/icml04-apprentice.pdf)
- **GAIL** — Generative Adversarial Imitation Learning (2016), Jonathan Ho and Stefano Ermon. [PDF](https://arxiv.org/pdf/1606.03476)
- **MAML** — Model-Agnostic Meta-Learning for Fast Adaptation of Deep Networks (2017), Chelsea Finn et al. [PDF](https://arxiv.org/pdf/1703.03400)
- **One-Shot** — One-Shot Imitation Learning (2017), Yan Duan et al. [PDF](https://arxiv.org/pdf/1703.07326)
- **EgoMimic** — EgoMimic: Scaling Imitation Learning via Egocentric Video (2024), Georgia Tech / Stanford. [PDF](https://arxiv.org/abs/2410.24221)

**Locomotion**

- **ZMP** — Zero-Moment Point: Thirty Five Years of Its Life (2004), Miomir Vukobratovic and Branislav Borovac. [PDF](https://www.researchgate.net/publication/220065796_Zero-Moment_Point_-_Thirty_Five_Years_of_its_Life)
- **Preview Control** — Biped Walking Pattern Generation by using Preview Control of Zero-Moment Point (2003), Shuuji Kajita et al. [PDF](https://www.researchgate.net/publication/4041375_Biped_walking_pattern_generation_by_using_preview_control_of_zero-moment_point)
- **Biped** — Reinforcement Learning for Versatile, Dynamic, and Robust Bipedal Locomotion Control (2024), Zhongyu Li et al. [PDF](https://arxiv.org/pdf/2401.16889)
- **Quadruped** — Learning Quadrupedal Locomotion over Challenging Terrain (2020), Joonho Lee et al. [PDF](https://arxiv.org/pdf/2010.11251)

**Generalization**

- **E2E** — End-to-End Training of Deep Visuomotor Policies (2015), Sergey Levine et al. [PDF](https://arxiv.org/pdf/1504.00702)
- **BC-Z** — BC-Z: Zero-Shot Task Generalization with Robotic Imitation Learning (2022), Eric Jang et al. [PDF](https://arxiv.org/pdf/2202.02005)
- **SayCan** — Do As I Can, Not As I Say: Grounding Language in Robotic Affordances (2022), Michael Ahn et al. [PDF](https://arxiv.org/pdf/2204.01691)
- **RT-1** — RT-1: Robotics Transformer for Real-World Control at Scale (2022), Anthony Brohan et al. [PDF](https://arxiv.org/pdf/2212.06817)
- **ACT** — Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (2023), Tony Z. Zhao et al. [PDF](https://arxiv.org/pdf/2304.13705)
- **VLA** — RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control (2023), Anthony Brohan et al. [PDF](https://arxiv.org/pdf/2307.15818)
- **π0** — π0: A Vision-Language-Action Flow Model for General Robot Control (2024), Kevin Black et al. [PDF](https://www.physicalintelligence.company/download/pi0.pdf)

**Foundation Models and the Modern Frontier**

- **π0-FAST** — FAST: Efficient Action Tokenization for Vision-Language-Action Models (2025), Physical Intelligence. [PDF](https://arxiv.org/abs/2501.09747)
- **π0.5** — π0.5: a VLA with Open-World Generalization (2025), Physical Intelligence. [PDF](https://arxiv.org/abs/2504.16054)
- **π\*0.6 / RECAP** — Self-Improving Robot Foundation Models with RL (2025), Physical Intelligence. [PDF](https://arxiv.org/abs/2511.14759)
- **GR00T N1** — GR00T N1: An Open Foundation Model for Generalist Humanoid Robots (2025), NVIDIA. [PDF](https://arxiv.org/abs/2503.14734)
- **Gemini Robotics** — Gemini Robotics: Bringing AI into the Physical World (2025), Google DeepMind. [PDF](https://arxiv.org/abs/2503.20020)
- **Helix** — Helix: A Vision-Language-Action Model for Generalist Humanoid Control (2025), Figure AI. [Site](https://www.figure.ai/news/helix)
- **GO-1 / AgiBot World** — AgiBot World Colosseo: A Large-Scale Manipulation Platform (2025), AgiBot. [PDF](https://arxiv.org/abs/2503.06669)
- **OpenVLA-OFT** — Fine-Tuning Vision-Language-Action Models: Optimizing Speed and Success (2025). [PDF](https://arxiv.org/abs/2502.19645)
- **DreamGen** — DreamGen: Unlocking Generalization in Robot Learning through Video World Models (2025), NVIDIA. [PDF](https://arxiv.org/abs/2505.12705)
- **Manipulation Scaling Laws** — Data Scaling Laws in Imitation Learning for Robotic Manipulation (2024), Tsinghua / Shanghai AI Lab. [PDF](https://arxiv.org/abs/2410.18647)
- **RoboArena** — RoboArena: Distributed Real-World Evaluation of Generalist Robot Policies (2025). [PDF](https://arxiv.org/abs/2506.18123)
- **LIBERO-Plus** — LIBERO-Plus: A Robustness Audit of Vision-Language-Action Models (2025). [PDF](https://arxiv.org/abs/2510.13626)
