import * as React from 'react';

import DimensionsStore from '../stores/DimensionsStore.js';

export default class ZoomControls extends React.Component {

  constructor (props) { super(props); }

  render () {
    return (
      <div 
        id='mapChartControls'
        style={{
          height: DimensionsStore.getDimensions().zoomControlsHeight,
          width: DimensionsStore.getDimensions().zoomControlsWidth,
          right: 0,
          bottom: DimensionsStore.getDimensions().zoomControlsBottom
        }}
      >
        <button
          onClick={ this.props.onZoomIn } 
          id='zoomInButton'
        >
          <svg 
            width={DimensionsStore.getDimensions().zoomControlsWidth} 
            height={DimensionsStore.getDimensions().zoomControlsHeight}
          >
            <g transform={ 'translate(' + (DimensionsStore.getDimensions().zoomControlsHeight / 2) + ' ' + (DimensionsStore.getDimensions().zoomControlsHeight / 2) + ')' }>
              <circle
                cx={0}
                cy={0}
                r={ (DimensionsStore.getDimensions().zoomControlsHeight / 2) }
                fill='silver'
              />
              <line
                x1={ (DimensionsStore.getDimensions().zoomControlsHeight / -4) } 
                x2={ (DimensionsStore.getDimensions().zoomControlsHeight / 4) } 
                y1={0}
                y2={0}
                stroke='#233036'
                strokeWidth={4}
              />
              <line
                x1={0}
                x2={0}
                y1={ (DimensionsStore.getDimensions().zoomControlsHeight / -4) } 
                y2={ (DimensionsStore.getDimensions().zoomControlsHeight / 4) } 
                stroke='#233036'
                strokeWidth={4}
              />
            </g>
          </svg>
        </button>

        <button
          onClick={ this.props.onZoomOut } 
        >
          <svg 
            width={DimensionsStore.getDimensions().zoomControlsWidth} 
            height={DimensionsStore.getDimensions().zoomControlsHeight}
          >
            <g transform={ 'translate(' + (DimensionsStore.getDimensions().zoomControlsHeight / 2) + ' ' + (DimensionsStore.getDimensions().zoomControlsHeight / 2) + ')' }>
              <circle
                cx={0}
                cy={0}
                r={ (DimensionsStore.getDimensions().zoomControlsHeight / 2) }
                fill='silver'
                fillOpacity={ (this.props.currentZoom > 1) ? 1 : 0.7 }
              />
              <line
                x1={ (DimensionsStore.getDimensions().zoomControlsHeight / -4) } 
                x2={ (DimensionsStore.getDimensions().zoomControlsHeight / 4) } 
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

          <svg 
            width={DimensionsStore.getDimensions().zoomControlsWidth} 
            height={DimensionsStore.getDimensions().zoomControlsHeight}
          >
            <defs>
              <marker id="arrow" markerWidth="4" markerHeight="4" refX="0" refY="0" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,1, L1,0 z" fill="#f00" />
              </marker>
            </defs>
            <g transform={ 'translate(' + (DimensionsStore.getDimensions().zoomControlsHeight / 2) + ' ' + (DimensionsStore.getDimensions().zoomControlsHeight / 2) + ') rotate(45)' }>
              <circle
                cx={0}
                cy={0}
                r={ (DimensionsStore.getDimensions().zoomControlsHeight / 2) }
                fill='silver'
                fillOpacity={ (this.props.currentZoom > 1) ? 1 : 0.7 }
              />
              <line
                x1={ (DimensionsStore.getDimensions().zoomControlsHeight / -4) } 
                x2={ (DimensionsStore.getDimensions().zoomControlsHeight / 4) } 
                y1={0}
                y2={0}
                stroke={ (this.props.currentZoom > 1) ? '#233036' : '#73797C' }
                strokeWidth={4}
              />
              <line
                x1={0}
                x2={0}
                y1={ (DimensionsStore.getDimensions().zoomControlsHeight / -4) } 
                y2={ (DimensionsStore.getDimensions().zoomControlsHeight / 4) } 
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