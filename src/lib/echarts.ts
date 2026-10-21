// Registers only the ECharts pieces the app uses, to keep the bundle small.
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { LineChart, ScatterChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent, MarkLineComponent } from 'echarts/components'

use([SVGRenderer, LineChart, ScatterChart, GridComponent, LegendComponent, TooltipComponent, MarkLineComponent])
