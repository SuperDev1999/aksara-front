import { GetStaticProps } from "next";
import type { InferGetStaticPropsType } from "next";
import { get } from "@lib/api";
import type { Page } from "@lib/types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Metadata from "@components/Metadata";
import { useTranslation } from "next-i18next";
import DrugAddictionDashboard from "@dashboards/drug-addiction";
import { StateDropdown, StateModal } from "@components/index";
import Layout from "@components/Layout";
import { routes } from "@lib/routes";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const DrugAddiction: Page = ({
  last_updated,
  timeseries,
  barmeter,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation();

  return (
    <>
      <Metadata
        title={t("nav.megamenu.dashboards.drug")}
        description={t("drug.description")}
        keywords={""}
      />
      <DrugAddictionDashboard
        last_updated={last_updated}
        timeseries={timeseries}
        barmeter={barmeter}
      />
    </>
  );
};

DrugAddiction.layout = (page: ReactNode) => (
  <Layout
    stateSelector={
      <StateDropdown
        url={routes.DRUG}
        currentState={(useRouter().query.state as string) ?? "mys"}
        hideOnScroll
      />
    }
  >
    <StateModal url={routes.DRUG} />
    {page}
  </Layout>
);
export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const i18n = await serverSideTranslations(locale!, ["common"]);

  const { data } = await get("/dashboard", { dashboard: "drug_dashboard" });

  return {
    props: {
      ...i18n,
      last_updated: new Date().valueOf(),
      timeseries: {
        data: data.timeseries.data.mys,
      },
      barmeter: data.bar_chart.data.mys,
    },
  };
};

export default DrugAddiction;
