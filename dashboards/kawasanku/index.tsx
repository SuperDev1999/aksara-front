import type { GeoJsonObject } from "geojson";
import type { OptionType } from "@components/types";
import Container from "@components/Container";
import Hero from "@components/Hero";
import Section from "@components/Section";
import { useTranslation } from "next-i18next";
import { FunctionComponent, useMemo } from "react";
import MalaysiaGeojson from "@lib/geojson/malaysia.json";
import Dropdown from "@components/Dropdown";
import Button from "@components/Button";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import JitterplotOverlay from "@components/Chart/Jitterplot/overlay";
import { useData } from "@hooks/useData";
import { useRouter } from "next/router";
import { STATES, DISTRICTS } from "@lib/schema/kawasanku";
import { routes } from "@lib/routes";

// const Choropleth = dynamic(() => import("@components/Chart/Choropleth"), { ssr: false });
const Jitterplot = dynamic(() => import("@components/Chart/Jitterplot"), { ssr: false });
const Pyramid = dynamic(() => import("@components/Chart/Pyramid"), { ssr: false });
const OSMapWrapper = dynamic(() => import("@components/OSMapWrapper"), { ssr: false });
const BarMeter = dynamic(() => import("@components/Chart/BarMeter"), { ssr: false });

interface KawasankuDashboardProps {
  area_type?: "district" | "dun" | "parlimen" | undefined;
  pyramid?: any;
  bar: any;
  jitterplot: any;
  jitterplot_options: Array<OptionType>;
}

const KawasankuDashboard: FunctionComponent<KawasankuDashboardProps> = ({
  area_type,
  pyramid,
  bar,
  jitterplot,
  jitterplot_options,
}) => {
  const { t } = useTranslation();

  const AREA_TYPES = [
    {
      label: t("kawasanku.area_types.district"),
      value: "district",
    },
    // {
    //   label: t("kawasanku.area_types.parlimen"),
    //   value: "parlimen",
    // },
    // {
    //   label: t("kawasanku.area_types.dun"),
    //   value: "dun",
    // },
  ];

  const router = useRouter();
  const state = (router.query.state as string) ?? "malaysia";
  const uid = router.query.id ? router.query.id : state;

  const { data, setData } = useData({
    state: STATES.find(item => item.value === state),
    area_type: area_type ? AREA_TYPES.find(item => item.value === area_type) : undefined,
    area: area_type ? DISTRICTS[state].find(item => item.value === uid) : undefined,
    active:
      uid !== "malaysia" ? jitterplot_options.find(option => option.value === uid) : undefined,
    comparator: [],
  });

  const handleComparator = (e: OptionType) => {
    if (data.comparator.length >= 3) return;
    if (data.comparator.includes(e.label)) return;

    setData("comparator", data.comparator.concat(e.label));
  };

  const isMalaysia = useMemo(() => data.state.value === "malaysia", [data.state]);

  return (
    <>
      <Hero background="relative to-transparent bg-gradient-to-b lg:bg-gradient-to-r from-[#EDF8ED] via-[#EDF8ED]">
        <div className="space-y-4 xl:w-2/3">
          <span className="text-sm font-bold uppercase tracking-widest text-dim">
            {t("nav.megamenu.dashboards.kawasanku")}
          </span>
          <h3 className="text-black"> {t("kawasanku.header")}</h3>
          <p className="text-dim">{t("kawasanku.description")}</p>

          <div className="flex w-full flex-col items-baseline justify-start gap-2 lg:flex-row">
            <p className="font-bold text-dim">{t("kawasanku.action")}:</p>
            <Dropdown
              options={STATES}
              selected={data.state}
              width="w-full lg:w-fit"
              sublabel={!isMalaysia ? t("common.state") + ":" : ""}
              onChange={(e: OptionType) => {
                setData("state", e);
                router.push(routes.KAWASANKU.concat("/", e.value !== "malaysia" ? e.value : ""));
              }}
              anchor="left"
            />
            <Dropdown
              anchor="left"
              options={AREA_TYPES}
              selected={data.area_type}
              onChange={(e: OptionType) => setData("area_type", e)}
              disabled={data.state.value === "malaysia"}
              sublabel={!isMalaysia ? "Geofilter:" : ""}
              placeholder={t("common.select")}
              width="w-full lg:w-fit"
            />
            <Dropdown
              anchor="left"
              options={
                data.area_type && data.state.value !== "malaysia"
                  ? {
                      district: DISTRICTS[data.state.value],
                      //   dun: DUNS[data.state.value],
                      //   parlimen: PARLIMENS[data.state.value],
                    }[data.area_type.value as "district"]
                  : []
              }
              disabled={!data.area_type || data.state.value === "malaysia"}
              selected={data.area}
              onChange={e => {
                setData("area", e);
                router.push(
                  routes.KAWASANKU.concat(
                    "/",
                    data.state.value,
                    "/",
                    data.area_type.value,
                    "/",
                    e.value
                  )
                );
              }}
              placeholder={t("common.select")}
              width="w-full lg:w-fit"
            />
            <Button
              icon={<XMarkIcon className="h-4 w-4" />}
              onClick={() => router.push(routes.KAWASANKU)}
            >
              {t("common.clear_all")}
            </Button>
          </div>
        </div>
        <OSMapWrapper
          geojson={MalaysiaGeojson as GeoJsonObject}
          position={[5.1420589, 80]}
          className="absolute top-0 left-0 -z-10 w-full lg:h-full"
          enableZoom={false}
          zoom={5}
        />
      </Hero>

      <Container className="min-h-screen">
        <Section
          title={"What does the population of Malaysia look like?"}
          date={"Data as of MyCensus 2020"}
        >
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-5 lg:gap-12">
            <div className="col-span-1 w-full lg:col-span-2">
              <Pyramid
                data={{
                  labels: pyramid.data.x,
                  datasets: [
                    {
                      label: t("kawasanku.keys.male"),
                      data: pyramid.data.male,
                      backgroundColor: "#0C204E",
                      borderWidth: 0,
                    },
                    {
                      label: t("kawasanku.keys.female"),
                      data: pyramid.data.female,
                      backgroundColor: "#B54768",
                      borderWidth: 0,
                    },
                  ],
                }}
                title={t("kawasanku.gender_distribution")}
                className="h-[500px] w-full"
              />
            </div>
            <div className="col-span-1 grid grid-cols-1 gap-6 lg:col-span-3 lg:grid-cols-3 lg:gap-12">
              <BarMeter
                title={t("kawasanku.sex")}
                data={bar.data.sex}
                layout="horizontal"
                sort="desc"
                unit="%"
                formatX={key => t(`kawasanku.keys.${key}`)}
              />
              <BarMeter
                title={t("kawasanku.agegroup")}
                data={bar.data.agegroup}
                layout="horizontal"
                sort="desc"
                unit="%"
                formatX={key => t(`kawasanku.keys.${key}`)}
              />
              <BarMeter
                title={t("kawasanku.nationality")}
                data={bar.data.nationality}
                layout="horizontal"
                sort="desc"
                unit="%"
                formatX={key => t(`kawasanku.keys.${key}`)}
              />
              <BarMeter
                title={t("kawasanku.ethnicity")}
                data={bar.data.ethnicity}
                layout="horizontal"
                sort="desc"
                unit="%"
                formatX={key => t(`kawasanku.keys.${key}`)}
              />
              <BarMeter
                title={t("kawasanku.religion")}
                data={bar.data.religion}
                layout="horizontal"
                sort="desc"
                unit="%"
                formatX={key => t(`kawasanku.keys.${key}`)}
              />
              <BarMeter
                title={t("kawasanku.marital")}
                data={bar.data.marital}
                layout="horizontal"
                sort="desc"
                unit="%"
                formatX={key => t(`kawasanku.keys.${key}`)}
              />
            </div>
          </div>
        </Section>
        <Section
          title={"A comparison of key variables across states"}
          date={"Data as of MyCensus 2020"}
        >
          <div className="flex w-full gap-2 lg:flex-row">
            <Dropdown
              anchor="left"
              width="w-fit"
              sublabel="Spotlight:"
              disabled={data.comparator.length >= 3}
              placeholder="Select "
              options={jitterplot_options}
              onChange={handleComparator}
            />

            {data?.active?.label && (
              <p className="flex items-center gap-2 py-1 px-2 text-sm font-medium leading-6">
                {data.active.label}
                <span className="block h-2 w-2 rounded-full bg-black" />
              </p>
            )}

            {data.comparator.length > 0 && (
              <>
                {data.comparator.map((item: string, index: number) => {
                  const styles = ["bg-danger", "bg-primary", "bg-warning"];
                  return (
                    <Button
                      className="border bg-washed py-1 px-2 text-sm font-medium leading-6"
                      icon={
                        <XMarkIcon
                          className="h-4 w-4"
                          onClick={() =>
                            setData(
                              "comparator",
                              data.comparator.filter((place: string) => place !== item)
                            )
                          }
                        />
                      }
                    >
                      <>
                        {item}
                        <div className={[styles[index], "h-2 w-2 rounded-full"].join(" ")} />
                      </>
                    </Button>
                  );
                })}

                <Button
                  icon={<XMarkIcon className="h-4 w-4" />}
                  onClick={() => setData("comparator", [])}
                >
                  Clear all
                </Button>
              </>
            )}
          </div>
          <div className="relative space-y-10">
            <JitterplotOverlay />
            <Jitterplot
              title="Geography"
              data={jitterplot.data.geography}
              active={data.active?.label}
              actives={data.comparator}
              format={key => t(`kawasanku.keys.${key}`)}
            />
            <Jitterplot
              title="Population"
              data={jitterplot.data.population}
              active={data.active?.label}
              actives={data.comparator}
              format={key => t(`kawasanku.keys.${key}`)}
            />
            <Jitterplot
              title="Economy"
              data={jitterplot.data.economy}
              active={data.active?.label}
              actives={data.comparator}
              format={key => t(`kawasanku.keys.${key}`)}
            />
            <Jitterplot
              title="Public Services"
              data={jitterplot.data.public_services}
              active={data.active?.label}
              actives={data.comparator}
              format={key => t(`kawasanku.keys.${key}`)}
            />
          </div>
        </Section>
        {/* <Section
          title={"A geographic visualisation of selected indicators"}
          date={"Data as of MyCensus 2020"}
        >
          <Choropleth />
        </Section> */}
      </Container>
    </>
  );
};

export default KawasankuDashboard;
