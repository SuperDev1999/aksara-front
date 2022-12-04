import type { Periods } from "@components/Chart/Timeseries";
import type { OptionType } from "@components/types";
import type { DownloadOptions } from "@lib/types";
import { FunctionComponent, useCallback, useRef } from "react";
import { default as Slider, SliderRef } from "@components/Chart/Slider";
import { default as Dropdown } from "@components/Dropdown";
import { default as dynamic } from "next/dynamic";
import { useData } from "@hooks/useData";
import { useFilter } from "@hooks/useFilter";
import { useSlice } from "@hooks/useSlice";
import { useWatch } from "@hooks/useWatch";
import { COVID_COLOR, GRAYBAR_COLOR, SHORT_PERIOD } from "@lib/constants";
import { CloudArrowDownIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { download } from "@lib/helpers";
import { useTranslation } from "next-i18next";
import canvasToSvg from "canvas2svg";

const Timeseries = dynamic(() => import("@components/Chart/Timeseries"), { ssr: false });

type FilterOption = {
  key: string;
  default: OptionType;
  options: Array<OptionType>;
};

interface CatalogueTimeseriesProps {
  params: {
    id: string;
  };
  dataset:
    | {
        chart: {
          x: number[];
          y: number[];
          line: number[];
        };
        meta: {
          en: {
            title: string;
          };
          bm: {
            title: string;
          };
        };
      }
    | any;
  filter_state: OptionType;
  filter_mapping: Array<FilterOption> | undefined;
  urls: {
    csv: string;
    parquet: string;
  };
  lang: "en" | "bm";
  onDownload: (prop: DownloadOptions) => void;
}

const CatalogueTimeseries: FunctionComponent<CatalogueTimeseriesProps> = ({
  lang,
  dataset,
  urls,
  filter_state,
  filter_mapping,
  params,
  onDownload,
}) => {
  const { t } = useTranslation();
  const { data, setData } = useData({
    ctx: undefined,
    minmax: [0, dataset.chart.x.length - 1],
  });
  const { coordinate } = useSlice(
    {
      x: dataset.chart.x,
      y: dataset.chart.y,
      line: dataset.chart.line,
    },
    data.minmax
  );
  const sliderRef = useRef<SliderRef>(null);
  const { filter, setFilter } = useFilter(filter_state, { id: params.id });

  const availableDownloads = useCallback<() => DownloadOptions>(
    () => ({
      chart: [
        {
          key: "image/png",
          image: data.ctx && data.ctx !== null && data.ctx.toBase64Image("image/png", 1),
          title: t("catalogue.image.title"),
          description: t("catalogue.image.desc"),
          icon: <CloudArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
          href: () => {
            download(data.ctx!.toBase64Image("image/png", 1), {
              category: "image/png",
              label: dataset.meta[lang].title,
              value: dataset.meta.unique_id,
            });
          },
        },
        {
          key: "image/svg",
          image: data.ctx && data.ctx !== null && data.ctx.toBase64Image("image/png", 1),
          title: t("catalogue.vector.title"),
          description: t("catalogue.vector.desc"),
          icon: <CloudArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
          href: () => {
            let canvas = canvasToSvg(data.ctx!.canvas.width, data.ctx!.canvas.height);
            canvas.drawImage(data.ctx!.canvas, 0, 0);
            download("data:image/svg+xml;utf8,".concat(canvas.getSerializedSvg()), {
              category: "image/svg",
              label: dataset.meta[lang].title,
              value: dataset.meta.unique_id,
            });
          },
        },
      ],
      data: [
        {
          key: "file/csv",
          image: "/static/images/icons/csv.png",
          title: t("catalogue.csv.title"),
          description: t("catalogue.csv.desc"),
          icon: <DocumentArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
          href: urls.csv,
        },
        {
          key: "file/parquet",
          image: "/static/images/icons/parquet.png",
          title: t("catalogue.parquet.title"),
          description: t("catalogue.parquet.desc"),
          icon: <DocumentArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
          href: urls.parquet,
        },
      ],
    }),
    [data.ctx]
  );

  useWatch(() => {
    setData("minmax", [0, dataset.chart.x.length - 1]);
    sliderRef.current && sliderRef.current.reset();
    onDownload(availableDownloads());
  }, [filter.range, dataset.chart.x, data.ctx]);

  return (
    <>
      {filter_mapping && (
        <div className="flex gap-3">
          {filter_mapping?.map((item: any, index: number) => (
            <Dropdown
              key={index}
              anchor={index > 0 ? "right" : "left"}
              options={item.options}
              selected={filter[item.key]}
              onChange={e => setFilter(item.key, e)}
            />
          ))}
        </div>
      )}
      <div>
        <Timeseries
          className="h-[350px] w-full"
          _ref={ref => setData("ctx", ref)}
          interval={filter.range?.value ? (SHORT_PERIOD[filter.range.value] as Periods) : "auto"}
          data={{
            labels: coordinate.x,
            datasets: [
              {
                type: "line",
                data: coordinate.y,
                borderColor: COVID_COLOR[300],
                borderWidth: 1.5,
              },
              {
                type: "bar",
                label: dataset.meta[lang].title,
                data: coordinate.y,
                backgroundColor: GRAYBAR_COLOR[300],
              },
            ],
          }}
        />
        <Slider
          ref={sliderRef}
          className="pt-7"
          type="range"
          data={dataset.chart.x}
          value={data.minmax}
          period={
            ["YEARLY", "MONTHLY"].includes(filter.range?.value)
              ? filter.range.value.toLowerCase().replace("ly", "")
              : "auto"
          }
          onChange={({ min, max }) => setData("minmax", [min, max])}
        />
      </div>
    </>
  );
};

export default CatalogueTimeseries;
