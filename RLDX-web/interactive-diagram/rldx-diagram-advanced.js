/**
 * RLDX Advanced Interactive Architecture Diagram
 * Professional visualization inspired by Distill.pub and Anthropic
 */

class RLDXAdvancedDiagram {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = 1200;
        this.height = 800;

        this.colors = {
            vla: '#50EACE',
            multimodal: '#9B87F5',
            latent: '#F59E87',
            vlm: '#87F5D9',
            performance: '#F5D987',
            bg: '#0a0a0a',
            bgSecondary: '#141414',
            border: '#2a2a2a',
            text: '#e8e8e8',
            textDim: '#666'
        };

        this.state = {
            hoveredNode: null,
            selectedNode: null,
            animationPhase: 0
        };

        this.init();
    }

    init() {
        this.createSVG();
        this.createDefs();
        this.createLayers();
        this.setupInteractions();
        this.startContinuousAnimations();
    }

    createSVG() {
        this.svg = this.container
            .append('svg')
            .attr('viewBox', `0 0 ${this.width} ${this.height}`)
            .attr('class', 'rldx-advanced-diagram');

        // Create main groups for layering
        this.bgLayer = this.svg.append('g').attr('class', 'background-layer');
        this.connectionLayer = this.svg.append('g').attr('class', 'connection-layer');
        this.nodeLayer = this.svg.append('g').attr('class', 'node-layer');
        this.annotationLayer = this.svg.append('g').attr('class', 'annotation-layer');
        this.particleLayer = this.svg.append('g').attr('class', 'particle-layer');
    }

    createDefs() {
        const defs = this.svg.append('defs');

        // Enhanced glow filter
        const glow = defs.append('filter').attr('id', 'advanced-glow').attr('filterUnits', 'userSpaceOnUse');
        glow.append('feGaussianBlur').attr('stdDeviation', '8').attr('result', 'coloredBlur');
        const glowMerge = glow.append('feMerge');
        glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
        glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
        glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Soft shadow
        const shadow = defs.append('filter').attr('id', 'soft-shadow');
        shadow.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', '4');
        shadow.append('feOffset').attr('dx', '0').attr('dy', '4').attr('result', 'offsetblur');
        shadow.append('feComponentTransfer').append('feFuncA').attr('type', 'linear').attr('slope', '0.2');
        const shadowMerge = shadow.append('feMerge');
        shadowMerge.append('feMergeNode');
        shadowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Gradients
        this.createGradients(defs);

        // Pattern for latent space
        this.createLatentPattern(defs);

        // Arrow markers with different colors
        ['vla', 'multimodal', 'latent', 'performance'].forEach(type => {
            defs.append('marker')
                .attr('id', `arrow-${type}`)
                .attr('viewBox', '0 0 10 10')
                .attr('refX', 9)
                .attr('refY', 5)
                .attr('markerWidth', 8)
                .attr('markerHeight', 8)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M 0 0 L 10 5 L 0 10 z')
                .attr('fill', this.colors[type]);
        });
    }

    createGradients(defs) {
        // Radial gradient for nodes
        const radialGrad = defs.append('radialGradient').attr('id', 'node-radial');
        radialGrad.append('stop').attr('offset', '0%').attr('stop-color', this.colors.vla).attr('stop-opacity', 0.8);
        radialGrad.append('stop').attr('offset', '100%').attr('stop-color', this.colors.vla).attr('stop-opacity', 0);

        // Mesh gradients for each component
        Object.keys(this.colors).forEach(key => {
            if (!['bg', 'bgSecondary', 'border', 'text', 'textDim'].includes(key)) {
                const grad = defs.append('linearGradient')
                    .attr('id', `grad-${key}`)
                    .attr('gradientTransform', 'rotate(45)');
                grad.append('stop').attr('offset', '0%').attr('stop-color', this.colors[key]).attr('stop-opacity', 0.3);
                grad.append('stop').attr('offset', '100%').attr('stop-color', this.colors[key]).attr('stop-opacity', 0.05);
            }
        });
    }

    createLatentPattern(defs) {
        const pattern = defs.append('pattern')
            .attr('id', 'latent-grid')
            .attr('width', 20)
            .attr('height', 20)
            .attr('patternUnits', 'userSpaceOnUse');

        pattern.append('circle')
            .attr('cx', 10)
            .attr('cy', 10)
            .attr('r', 1)
            .attr('fill', this.colors.latent)
            .attr('opacity', 0.3);
    }

    createLayers() {
        // Title with subtitle
        this.createTitle();

        // Input sensors with professional icons
        this.createInputSensors();

        // VLA processing core with layers
        this.createVLACore();

        // Latent space with embedding visualization
        this.createLatentSpace();

        // Output actions with real-time feedback
        this.createActionOutputs();

        // Information flow paths
        this.createFlowPaths();

        // Interactive annotations
        this.createAnnotations();
    }

    createTitle() {
        const titleGroup = this.annotationLayer.append('g')
            .attr('transform', `translate(${this.width / 2}, 40)`);

        titleGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', this.colors.text)
            .attr('font-size', '28')
            .attr('font-weight', '700')
            .attr('letter-spacing', '1px')
            .text('RLDX Architecture (Temporary)');

        titleGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 28)
            .attr('fill', this.colors.textDim)
            .attr('font-size', '14')
            .text('Conceptual visualization - Details subject to change');
    }

    createInputSensors() {
        const sensors = [
            {
                id: 'vision',
                name: 'Visual Perception',
                detail: 'RGB-D Camera • 30Hz',
                x: 120,
                y: 200,
                color: this.colors.multimodal,
                iconPath: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
                metrics: ['Resolution: 1920×1080', 'Depth range: 0.5-4m', 'FOV: 69°×42°']
            },
            {
                id: 'tactile',
                name: 'Tactile Sensing',
                detail: 'Force/Pressure • 1kHz',
                x: 120,
                y: 330,
                color: this.colors.multimodal,
                iconPath: 'M11 2c3.31 0 6 2.69 6 6 0 1.66-.68 3.16-1.77 4.24l-.01-.01L12 15.45l-3.22-3.22C7.68 11.16 7 9.66 7 8c0-3.31 2.69-6 6-6zm0 2c-2.21 0-4 1.79-4 4 0 .88.36 1.68.94 2.26L11 13.34l3.06-3.08c.58-.58.94-1.38.94-2.26 0-2.21-1.79-4-4-4zm0 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z',
                metrics: ['16 sensors per finger', 'Force: 0-50N', 'Pressure: 10-500kPa']
            },
            {
                id: 'proprioception',
                name: 'Proprioception',
                detail: 'Joint State • 500Hz',
                x: 120,
                y: 460,
                color: this.colors.multimodal,
                iconPath: 'M12 2L4 9h3v12h10V9h3L12 2zm0 3.84L15.84 9h-2.09v10h-3.5V9H8.16L12 5.84z',
                metrics: ['22 DoF tracking', 'Position accuracy: 0.1°', 'Torque: -20 to +20Nm']
            },
            {
                id: 'language',
                name: 'Language Input',
                detail: 'Natural Language • LLM',
                x: 120,
                y: 590,
                color: this.colors.vlm,
                iconPath: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
                metrics: ['Context: 8K tokens', 'Latency: <50ms', 'Multilingual support']
            }
        ];

        sensors.forEach(sensor => {
            this.createSensorNode(sensor);
        });
    }

    createSensorNode(sensor) {
        const group = this.nodeLayer.append('g')
            .attr('class', `sensor-node sensor-${sensor.id}`)
            .attr('transform', `translate(${sensor.x}, ${sensor.y})`)
            .datum(sensor);

        // Outer glow circle
        group.append('circle')
            .attr('r', 45)
            .attr('fill', 'url(#node-radial)')
            .attr('opacity', 0);

        // Main container
        const container = group.append('g').attr('class', 'sensor-container');

        // Background card
        container.append('rect')
            .attr('x', -35)
            .attr('y', -35)
            .attr('width', 250)
            .attr('height', 70)
            .attr('rx', 8)
            .attr('fill', this.colors.bgSecondary)
            .attr('stroke', sensor.color)
            .attr('stroke-width', 2)
            .attr('filter', 'url(#soft-shadow)');

        // Icon background
        container.append('circle')
            .attr('r', 24)
            .attr('fill', sensor.color)
            .attr('opacity', 0.15);

        // Professional icon (using SVG path)
        container.append('path')
            .attr('d', sensor.iconPath)
            .attr('transform', 'translate(-12, -12) scale(1)')
            .attr('fill', sensor.color)
            .attr('opacity', 0.9);

        // Text labels
        container.append('text')
            .attr('x', 45)
            .attr('y', -8)
            .attr('fill', this.colors.text)
            .attr('font-size', '14')
            .attr('font-weight', '600')
            .text(sensor.name);

        container.append('text')
            .attr('x', 45)
            .attr('y', 10)
            .attr('fill', this.colors.textDim)
            .attr('font-size', '11')
            .text(sensor.detail);

        // Activity indicator
        const indicator = container.append('g')
            .attr('transform', 'translate(200, 0)')
            .attr('class', 'activity-indicator');

        indicator.append('circle')
            .attr('r', 4)
            .attr('fill', sensor.color)
            .attr('class', 'pulse-indicator');

        // Signal bars (animated)
        for (let i = 0; i < 3; i++) {
            indicator.append('rect')
                .attr('x', 12 + i * 6)
                .attr('y', -8 + (2 - i) * 3)
                .attr('width', 3)
                .attr('height', 8 + i * 3)
                .attr('fill', sensor.color)
                .attr('opacity', 0.6)
                .attr('class', `signal-bar-${i}`);
        }
    }

    createVLACore() {
        const x = 500, y = 400;

        const coreGroup = this.nodeLayer.append('g')
            .attr('class', 'vla-core')
            .attr('transform', `translate(${x}, ${y})`);

        // Main container with depth
        const width = 280, height = 400;

        // Shadow layer
        coreGroup.append('rect')
            .attr('x', -width/2 + 5)
            .attr('y', -height/2 + 5)
            .attr('width', width)
            .attr('height', height)
            .attr('rx', 16)
            .attr('fill', '#000')
            .attr('opacity', 0.3);

        // Main body
        coreGroup.append('rect')
            .attr('x', -width/2)
            .attr('y', -height/2)
            .attr('width', width)
            .attr('height', height)
            .attr('rx', 16)
            .attr('fill', `url(#grad-vla)`)
            .attr('stroke', this.colors.vla)
            .attr('stroke-width', 3);

        // Header section
        const header = coreGroup.append('g')
            .attr('transform', `translate(0, ${-height/2 + 30})`);

        header.append('text')
            .attr('text-anchor', 'middle')
            .attr('fill', this.colors.vla)
            .attr('font-size', '20')
            .attr('font-weight', '700')
            .text('4D+ VLA Core');

        header.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 20)
            .attr('fill', this.colors.textDim)
            .attr('font-size', '11')
            .text('Unified Perception • Reasoning • Control');

        // Processing layers visualization
        const layersY = -height/2 + 80;
        const layerData = [
            { name: 'Vision Encoder', height: 45, color: this.colors.multimodal },
            { name: 'Language Processor', height: 40, color: this.colors.vlm },
            { name: 'Fusion Layer', height: 50, color: this.colors.vla },
            { name: 'Policy Network', height: 45, color: this.colors.vla },
            { name: 'Action Decoder', height: 40, color: this.colors.latent }
        ];

        layerData.forEach((layer, i) => {
            const layerGroup = coreGroup.append('g')
                .attr('class', `processing-layer layer-${i}`)
                .attr('transform', `translate(0, ${layersY + i * 55})`);

            // Layer background
            layerGroup.append('rect')
                .attr('x', -120)
                .attr('y', 0)
                .attr('width', 240)
                .attr('height', layer.height)
                .attr('rx', 6)
                .attr('fill', layer.color)
                .attr('opacity', 0.15)
                .attr('stroke', layer.color)
                .attr('stroke-width', 1)
                .attr('stroke-opacity', 0.3);

            // Layer label
            layerGroup.append('text')
                .attr('x', -110)
                .attr('y', layer.height / 2 + 4)
                .attr('fill', this.colors.text)
                .attr('font-size', '11')
                .attr('font-weight', '500')
                .text(layer.name);

            // Processing indicators (animated dots)
            for (let j = 0; j < 8; j++) {
                layerGroup.append('circle')
                    .attr('cx', 80 + (j % 4) * 8)
                    .attr('cy', 12 + Math.floor(j / 4) * 8)
                    .attr('r', 2)
                    .attr('fill', layer.color)
                    .attr('class', `process-dot dot-${j}`);
            }
        });

        // Stats panel
        const stats = coreGroup.append('g')
            .attr('transform', `translate(0, ${height/2 - 40})`);

        const statsData = [
            { label: 'Parameters', value: '2.7B', x: -80 },
            { label: 'Latency', value: '<100ms', x: 0 },
            { label: 'FPS', value: '30Hz', x: 80 }
        ];

        statsData.forEach(stat => {
            const statGroup = stats.append('g')
                .attr('transform', `translate(${stat.x}, 0)`);

            statGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('fill', this.colors.textDim)
                .attr('font-size', '9')
                .text(stat.label);

            statGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 15)
                .attr('fill', this.colors.vla)
                .attr('font-size', '13')
                .attr('font-weight', '600')
                .text(stat.value);
        });
    }

    createLatentSpace() {
        const x = 900, y = 400;

        const latentGroup = this.nodeLayer.append('g')
            .attr('class', 'latent-space')
            .attr('transform', `translate(${x}, ${y})`);

        const width = 220, height = 400;

        // Main container
        latentGroup.append('rect')
            .attr('x', -width/2)
            .attr('y', -height/2)
            .attr('width', width)
            .attr('height', height)
            .attr('rx', 16)
            .attr('fill', `url(#grad-latent)`)
            .attr('stroke', this.colors.latent)
            .attr('stroke-width', 2);

        // Title
        latentGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -height/2 + 30)
            .attr('fill', this.colors.latent)
            .attr('font-size', '16')
            .attr('font-weight', '700')
            .text('Latent Action Space');

        latentGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -height/2 + 48)
            .attr('fill', this.colors.textDim)
            .attr('font-size', '10')
            .text('Cross-Embodiment Encoding');

        // Embedding visualization (point cloud)
        const embeddingGroup = latentGroup.append('g')
            .attr('class', 'embedding-vis')
            .attr('transform', `translate(0, -50)`);

        // Generate random points in embedding space
        const points = d3.range(150).map(() => ({
            x: (Math.random() - 0.5) * 180,
            y: (Math.random() - 0.5) * 250,
            cluster: Math.floor(Math.random() * 3),
            size: Math.random() * 2 + 1
        }));

        embeddingGroup.selectAll('.embedding-point')
            .data(points)
            .enter()
            .append('circle')
            .attr('class', 'embedding-point')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.size)
            .attr('fill', this.colors.latent)
            .attr('opacity', 0.4);

        // Cluster centers
        const clusters = [
            { x: -50, y: -60, label: 'Grasp' },
            { x: 40, y: -30, label: 'Rotate' },
            { x: 0, y: 50, label: 'Release' }
        ];

        clusters.forEach(cluster => {
            const clusterG = embeddingGroup.append('g')
                .attr('transform', `translate(${cluster.x}, ${cluster.y})`);

            clusterG.append('circle')
                .attr('r', 25)
                .attr('fill', 'none')
                .attr('stroke', this.colors.latent)
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '3,3')
                .attr('opacity', 0.5);

            clusterG.append('text')
                .attr('text-anchor', 'middle')
                .attr('y', 4)
                .attr('fill', this.colors.text)
                .attr('font-size', '9')
                .attr('font-weight', '600')
                .text(cluster.label);
        });

        // Dimension info
        latentGroup.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', height/2 - 20)
            .attr('fill', this.colors.textDim)
            .attr('font-size', '10')
            .text('Dimensionality: 512D');
    }

    createActionOutputs() {
        const outputs = [
            {
                id: 'position',
                name: 'Position Δ',
                detail: 'x, y, z',
                x: 1080,
                y: 250,
                color: this.colors.performance,
                value: '[+0.02, -0.01, +0.03]',
                unit: 'm'
            },
            {
                id: 'orientation',
                name: 'Orientation Δ',
                detail: 'roll, pitch, yaw',
                x: 1080,
                y: 400,
                color: this.colors.performance,
                value: '[+2.1°, -0.5°, +1.3°]',
                unit: '°'
            },
            {
                id: 'gripper',
                name: 'Gripper Control',
                detail: 'force, aperture',
                x: 1080,
                y: 550,
                color: this.colors.performance,
                value: '[12.5N, 45mm]',
                unit: ''
            }
        ];

        outputs.forEach(output => {
            this.createActionNode(output);
        });
    }

    createActionNode(action) {
        const group = this.nodeLayer.append('g')
            .attr('class', `action-node action-${action.id}`)
            .attr('transform', `translate(${action.x}, ${action.y})`)
            .datum(action);

        // Hexagonal container
        const hexPath = this.createHexPath(35);

        group.append('path')
            .attr('d', hexPath)
            .attr('fill', action.color)
            .attr('opacity', 0.15)
            .attr('stroke', action.color)
            .attr('stroke-width', 2.5);

        // Label
        group.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -50)
            .attr('fill', this.colors.text)
            .attr('font-size', '13')
            .attr('font-weight', '600')
            .text(action.name);

        group.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -35)
            .attr('fill', this.colors.textDim)
            .attr('font-size', '10')
            .text(action.detail);

        // Value display
        group.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 5)
            .attr('fill', action.color)
            .attr('font-size', '11')
            .attr('font-family', 'monospace')
            .attr('class', 'action-value')
            .text(action.value);
    }

    createHexPath(size) {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = size * Math.cos(angle);
            const y = size * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return `M ${points.join(' L ')} Z`;
    }

    createFlowPaths() {
        const flows = [
            // Sensors to VLA
            { from: { x: 370, y: 200 }, to: { x: 360, y: 300 }, color: this.colors.multimodal, width: 3 },
            { from: { x: 370, y: 330 }, to: { x: 370, y: 350 }, color: this.colors.multimodal, width: 3 },
            { from: { x: 370, y: 460 }, to: { x: 380, y: 450 }, color: this.colors.multimodal, width: 3 },
            { from: { x: 370, y: 590 }, to: { x: 390, y: 500 }, color: this.colors.vlm, width: 3 },

            // VLA to Latent
            { from: { x: 640, y: 400 }, to: { x: 790, y: 400 }, color: this.colors.vla, width: 4 },

            // Latent to Actions
            { from: { x: 1010, y: 350 }, to: { x: 1045, y: 250 }, color: this.colors.latent, width: 3 },
            { from: { x: 1010, y: 400 }, to: { x: 1045, y: 400 }, color: this.colors.latent, width: 3 },
            { from: { x: 1010, y: 450 }, to: { x: 1045, y: 550 }, color: this.colors.latent, width: 3 }
        ];

        flows.forEach((flow, i) => {
            const path = this.connectionLayer.append('path')
                .datum(flow)
                .attr('class', `flow-path flow-${i}`)
                .attr('d', this.createSmoothPath(flow.from, flow.to))
                .attr('stroke', flow.color)
                .attr('stroke-width', flow.width)
                .attr('stroke-opacity', 0.4)
                .attr('fill', 'none')
                .attr('stroke-linecap', 'round')
                .attr('marker-end', `url(#arrow-${this.getColorKey(flow.color)})`);

            // Animated dash for data flow
            const length = path.node().getTotalLength();
            path.attr('stroke-dasharray', `${length}`)
                .attr('stroke-dashoffset', length)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0)
                .on('end', function repeat() {
                    d3.select(this)
                        .attr('stroke-dashoffset', length)
                        .transition()
                        .duration(2000)
                        .ease(d3.easeLinear)
                        .attr('stroke-dashoffset', 0)
                        .on('end', repeat);
                });
        });
    }

    createSmoothPath(from, to) {
        const midX = (from.x + to.x) / 2;
        return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
    }

    getColorKey(color) {
        return Object.keys(this.colors).find(key => this.colors[key] === color) || 'vla';
    }

    createAnnotations() {
        // Add technical callouts
        const callouts = [
            {
                x: 500,
                y: 150,
                title: 'Real-Time Processing',
                text: 'Sub-100ms latency from perception to action',
                anchor: 'middle'
            },
            {
                x: 900,
                y: 650,
                title: 'Shared Representation',
                text: 'Enables zero-shot transfer across embodiments',
                anchor: 'middle'
            }
        ];

        callouts.forEach(callout => {
            const group = this.annotationLayer.append('g')
                .attr('transform', `translate(${callout.x}, ${callout.y})`);

            group.append('rect')
                .attr('x', -100)
                .attr('y', -20)
                .attr('width', 200)
                .attr('height', 40)
                .attr('rx', 6)
                .attr('fill', this.colors.bgSecondary)
                .attr('stroke', this.colors.vla)
                .attr('stroke-width', 1)
                .attr('opacity', 0.8);

            group.append('text')
                .attr('text-anchor', callout.anchor)
                .attr('y', -5)
                .attr('fill', this.colors.vla)
                .attr('font-size', '11')
                .attr('font-weight', '600')
                .text(callout.title);

            group.append('text')
                .attr('text-anchor', callout.anchor)
                .attr('y', 10)
                .attr('fill', this.colors.textDim)
                .attr('font-size', '9')
                .text(callout.text);
        });
    }

    setupInteractions() {
        // Add hover effects to all nodes
        this.nodeLayer.selectAll('.sensor-node, .action-node')
            .on('mouseenter', (event, d) => this.onNodeHover(event, d))
            .on('mouseleave', () => this.onNodeLeave())
            .style('cursor', 'pointer');

        // Click to expand details
        this.nodeLayer.selectAll('.vla-core, .latent-space')
            .on('click', (event, d) => this.onCoreClick(event))
            .style('cursor', 'pointer');
    }

    onNodeHover(event, data) {
        const node = d3.select(event.currentTarget);

        // Highlight effect
        node.select('circle, rect, path')
            .transition()
            .duration(200)
            .attr('stroke-width', 3)
            .attr('filter', 'url(#advanced-glow)');

        // Show metrics if available
        if (data && data.metrics) {
            this.showTooltip(event, data);
        }
    }

    onNodeLeave() {
        d3.selectAll('.sensor-node circle, .sensor-node rect, .action-node path')
            .transition()
            .duration(200)
            .attr('stroke-width', 2)
            .attr('filter', 'url(#soft-shadow)');

        this.hideTooltip();
    }

    onCoreClick(event) {
        // Toggle detailed view (could expand to show architecture details)
        console.log('Core clicked - expand for detailed view');
    }

    showTooltip(event, data) {
        if (!this.tooltip) {
            this.tooltip = d3.select('body').append('div')
                .attr('class', 'rldx-tooltip-advanced')
                .style('opacity', 0);
        }

        let content = `<strong>${data.name}</strong><br/>`;
        if (data.metrics) {
            content += '<div class="metrics">';
            data.metrics.forEach(metric => {
                content += `<div class="metric-item">• ${metric}</div>`;
            });
            content += '</div>';
        }

        this.tooltip.html(content)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 28}px`)
            .transition()
            .duration(200)
            .style('opacity', 1);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        }
    }

    startContinuousAnimations() {
        // Pulse activity indicators
        this.animateActivityIndicators();

        // Animate processing dots
        this.animateProcessingDots();

        // Animate signal bars
        this.animateSignalBars();

        // Drift embedding points
        this.animateEmbeddingDrift();

        // Update action values
        this.animateActionValues();
    }

    animateActivityIndicators() {
        d3.selectAll('.pulse-indicator')
            .each(function() {
                function pulse() {
                    d3.select(this)
                        .transition()
                        .duration(800)
                        .attr('r', 6)
                        .attr('opacity', 0.3)
                        .transition()
                        .duration(800)
                        .attr('r', 4)
                        .attr('opacity', 1)
                        .on('end', pulse);
                }
                pulse.call(this);
            });
    }

    animateProcessingDots() {
        d3.selectAll('.process-dot')
            .each(function(d, i) {
                function blink() {
                    d3.select(this)
                        .transition()
                        .delay(i * 100)
                        .duration(300)
                        .attr('opacity', 1)
                        .transition()
                        .duration(300)
                        .attr('opacity', 0.2)
                        .on('end', blink);
                }
                blink.call(this);
            });
    }

    animateSignalBars() {
        for (let i = 0; i < 3; i++) {
            d3.selectAll(`.signal-bar-${i}`)
                .each(function() {
                    function wave() {
                        d3.select(this)
                            .transition()
                            .delay(i * 150)
                            .duration(500)
                            .attr('opacity', 1)
                            .transition()
                            .duration(500)
                            .attr('opacity', 0.3)
                            .on('end', wave);
                    }
                    wave.call(this);
                });
        }
    }

    animateEmbeddingDrift() {
        d3.selectAll('.embedding-point')
            .each(function() {
                const point = d3.select(this);
                const cx = +point.attr('cx');
                const cy = +point.attr('cy');

                function drift() {
                    const newX = cx + (Math.random() - 0.5) * 3;
                    const newY = cy + (Math.random() - 0.5) * 3;

                    point.transition()
                        .duration(2000)
                        .attr('cx', newX)
                        .attr('cy', newY)
                        .transition()
                        .duration(2000)
                        .attr('cx', cx)
                        .attr('cy', cy)
                        .on('end', drift);
                }
                drift();
            });
    }

    animateActionValues() {
        // Simulate changing action values
        setInterval(() => {
            d3.selectAll('.action-value')
                .transition()
                .duration(500)
                .attr('opacity', 0.5)
                .transition()
                .duration(500)
                .attr('opacity', 1);
        }, 2000);
    }
}

// Initialize
if (typeof d3 !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('rldx-diagram-container');
        if (container) {
            new RLDXAdvancedDiagram('rldx-diagram-container');
        }
    });
}
