import PoCBlockShell from '../blocks/PoCBlockShell';

export default {
  title: 'PoC/Blocks/BlockShell',
};

export const Default = {
  render: () => (
    <PoCBlockShell blockId="forecast-matrix">
      <div className="p-4 border border-[#30363d] text-gray-200">BlockShell 샘플 슬롯</div>
    </PoCBlockShell>
  ),
};
