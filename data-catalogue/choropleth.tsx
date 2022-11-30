import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { default as dynamic } from "next/dynamic";
import { useExport } from "@hooks/useExport";
import { useTranslation } from "next-i18next";
import { CloudArrowDownIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { download } from "@lib/helpers";
import type { DownloadOptions } from "@lib/types";

const Choropleth = dynamic(() => import("@components/Chart/Choropleth"), { ssr: false });

type ChoroPoint = {
  id: string;
  value: number;
};

interface CatalogueChoroplethProps {
  config: {
    color: string;
    geojson: string;
  };
  dataset: {
    chart: Array<ChoroPoint>;
    meta: {
      en: {
        title: string;
      };
      bm: {
        title: string;
      };
      unique_id: string;
    };
  };
  lang: "en" | "bm";
  urls: {
    csv: string;
    parquet: string;
  };
  onDownload: (prop: DownloadOptions) => void;
}

const CatalogueChoropleth: FunctionComponent<CatalogueChoroplethProps> = ({
  dataset,
  config,
  lang,
  urls,
  onDownload,
}) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState<boolean>(false);
  const { onRefChange, svg, png } = useExport(mounted);

  useEffect(() => {
    onDownload(availableDownloads());
  }, [svg, png, mounted]);

  const availableDownloads = useCallback(
    () => ({
      chart: [
        {
          key: "image/png",
          image: png,
          title: t("catalogue.image.title"),
          description: t("catalogue.image.desc"),
          icon: <CloudArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
          href: () => {
            if (png) {
              download(png, {
                category: "image/png",
                label: dataset.meta[lang].title,
                value: dataset.meta.unique_id,
              });
            }
          },
        },
        {
          key: "image/svg",
          image: png,
          title: t("catalogue.vector.title"),
          description: t("catalogue.vector.desc"),
          icon: <CloudArrowDownIcon className="h-6 min-w-[24px] text-dim" />,
          href: () => {
            if (svg) {
              download(svg, {
                category: "image/svg",
                label: dataset.meta[lang].title,
                value: dataset.meta.unique_id,
              });
            }
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
    [mounted, svg, png]
  );

  return (
    <>
      <div ref={onRefChange}>
        <Choropleth
          className="h-[350px] w-full lg:h-[600px]"
          data={dataset.chart}
          colorScale={config.color}
          graphChoice={config.geojson.replace(".json", "") as "state" | "dun" | "parlimen"}
          onReady={e => setMounted(e)}
        />
      </div>
    </>
  );
};

export default CatalogueChoropleth;
