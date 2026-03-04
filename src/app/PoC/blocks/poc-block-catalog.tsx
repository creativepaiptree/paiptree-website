import Navbar from '../sections/Navbar';
import LeftSidebar from '../sections/LeftSidebar';
import Header from '../sections/Header';
import ForecastMatrix from '../sections/ForecastMatrix';
import WeightDistribution from '../sections/WeightDistribution';
import RightSidebar from '../sections/RightSidebar';
import CCTVMonitor from '../sections/CCTVMonitor';
import PoCBlockShell from './PoCBlockShell';
import { type PocBlockContext, type PocBlockRegion, type PocBlockState } from './poc-block-policy';

export type PoCBlockRender = () => JSX.Element;

export type PoCBlockSpec = {
  id: string;
  region: PocBlockRegion;
  policyId: string;
  state: PocBlockState;
  render: PoCBlockRender;
};

export type PoCBlockCatalog = {
  top: PoCBlockSpec[];
  left: PoCBlockSpec[];
  center: PoCBlockSpec[];
  right: PoCBlockSpec[];
  bottom: PoCBlockSpec[];
};

const buildBlock = ({
  policyId,
  region,
  state,
  render,
}: {
  policyId: string;
  region: PocBlockRegion;
  state: PocBlockState;
  render: () => JSX.Element;
}): PoCBlockSpec => ({
  id: policyId,
  region,
  policyId,
  state,
  render: () => <PoCBlockShell blockId={policyId}>{render()}</PoCBlockShell>,
});

const createTopRegion = (ctx: PocBlockContext): PoCBlockSpec[] => {
  return [
    buildBlock({
      policyId: 'top-navigation',
      region: 'top',
      state: 'default',
      render: () => <Navbar lang={ctx.lang} setLang={ctx.setLang} />,
    }),
  ];
};

const createLeftRegion = (ctx: PocBlockContext): PoCBlockSpec[] => {
  return [
    buildBlock({
      policyId: 'left-sidebar-alerts',
      region: 'left',
      state: 'default',
      render: () => <LeftSidebar lang={ctx.lang} />,
    }),
  ];
};

const createCenterRegion = (ctx: PocBlockContext): PoCBlockSpec[] => {
  return [
    buildBlock({
      policyId: 'header-overview',
      region: 'center',
      state: 'default',
      render: () => <Header lang={ctx.lang} onOpenTrace={ctx.onOpenTrace} />,
    }),
    buildBlock({
      policyId: 'forecast-matrix',
      region: 'center',
      state: 'default',
      render: () => <ForecastMatrix lang={ctx.lang} onOpenTrace={ctx.onOpenTrace} />,
    }),
    buildBlock({
      policyId: 'weight-distribution',
      region: 'center',
      state: 'default',
      render: () => <WeightDistribution lang={ctx.lang} onOpenTrace={ctx.onOpenTrace} />,
    }),
  ];
};

const createRightRegion = (ctx: PocBlockContext): PoCBlockSpec[] => {
  return [
    buildBlock({
      policyId: 'right-sidebar-overview',
      region: 'right',
      state: 'default',
      render: () => (
        <RightSidebar
          lang={ctx.lang}
          feedbinBySensor={ctx.rightSidebarData.feedbinBySensor}
          temperatureBySensor={ctx.rightSidebarData.temperatureBySensor}
          humidityBySensor={ctx.rightSidebarData.humidityBySensor}
          totalBirdCount={ctx.rightSidebarData.totalBirdCount}
          onOpenTrace={ctx.onOpenTrace}
        />
      ),
    }),
  ];
};

const createBottomRegion = (ctx: PocBlockContext): PoCBlockSpec[] => {
  return [
    buildBlock({
      policyId: 'cctv-monitor',
      region: 'bottom',
      state: 'default',
      render: () => <CCTVMonitor lang={ctx.lang} onOpenTrace={ctx.onOpenTrace} />,
    }),
  ];
};

export const buildPocBlockCatalog = (ctx: PocBlockContext): PoCBlockCatalog => {
  return {
    top: createTopRegion(ctx),
    left: createLeftRegion(ctx),
    center: createCenterRegion(ctx),
    right: createRightRegion(ctx),
    bottom: createBottomRegion(ctx),
  };
};
