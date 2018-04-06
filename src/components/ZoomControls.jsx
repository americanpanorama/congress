import * as React from 'react';

import DimensionsStore from '../stores/DimensionsStore.js';

export default class ZoomControls extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
      <div 
        id='mapChartControls'
        style={{
          height: DimensionsStore.getDimensions().mapLegendHeight,
          right: DimensionsStore.getDimensions().gutterPadding,
          bottom: DimensionsStore.getDimensions().mapLegendHeight + DimensionsStore.getDimensions().gutterPadding //DimensionsStore.getDimensions().timelineHeight + DimensionsStore.getDimensions().gutterPadding * 1.5
        }}
      >
        <button
          onClick={ this.props.onZoomIn } 
          id='zoomInButton'
        >
          <svg width={40} height={40}>
            <g transform='translate(20 20)'>
              <circle
                cx={0}
                cy={0}
                r={20}
                fill='silver'
              />
              <line
                x1={-10}
                x2={10}
                y1={0}
                y2={0}
                stroke='#233036'
                strokeWidth={4}
              />
              <line
                x1={0}
                x2={0}
                y1={-10}
                y2={10}
                stroke='#233036'
                strokeWidth={4}
              />
            </g>
          </svg>
        </button>

        <button
          onClick={ this.props.onZoomOut } 
        >
          <svg width={40} height={40}>
            <g transform='translate(20 20)'>
              <circle
                cx={0}
                cy={0}
                r={20}
                fill='silver'
                fillOpacity={ (this.props.currentZoom > 1) ? 1 : 0.7 }
              />
              <line
                x1={-10}
                x2={10}
                y1={0}
                y2={0}
                stroke={ (this.props.currentZoom > 1) ? '#233036' : '#73797C' }
                strokeWidth={4}
              />
            </g>
          </svg>
        </button>

        {/* button for national view*/}




        <button
          onClick={ this.props.resetView } 
        >

          <svg width={40} height={40}>
            <defs>
              <marker id="arrow" markerWidth="4" markerHeight="4" refX="0" refY="0" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,1, L1,0 z" fill="#f00" />
              </marker>
            </defs>
            <g transform='translate(20 20) rotate(45)'>
              <circle
                cx={0}
                cy={0}
                r={20}
                fill='silver'
                fillOpacity={ (this.props.currentZoom > 1) ? 1 : 0.7 }
              />
              <line
                x1={-10}
                x2={10}
                y1={0}
                y2={0}
                stroke={ (this.props.currentZoom > 1) ? '#233036' : '#73797C' }
                strokeWidth={4}
              />
              <line
                x1={0}
                x2={0}
                y1={-10}
                y2={10}
                stroke={ (this.props.currentZoom > 1) ? '#233036' : '#73797C' }
                strokeWidth={4}
              />
            </g>
          </svg>
        </button>
      </div>
    );
  }
}