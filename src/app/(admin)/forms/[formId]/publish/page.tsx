import QRCode from "qrcode";
import {
  CheckCircle2,
  CircleAlert,
  EyeOff,
  Link2,
  Rocket,
  QrCode,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyPublicLinkButton } from "@/features/forms/components/copy-public-link-button";
import { PublishAccessControlsForm } from "@/features/forms/components/publish-access-controls-form";
import { publishFormAction } from "@/features/forms/actions";
import {
  buildHotelDefaultSurveyUrl,
  buildPublicSurveyUrl,
  resolvePublicSlug,
} from "@/features/forms/publication";
import { requireHotelContext } from "@/lib/session";
import { getFormById } from "@/server/data";

export default async function PublishFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  const { formId } = await params;
  const { notice, error } = await searchParams;
  const context = await requireHotelContext();
  const form = await getFormById(formId);

  if (!form) {
    return <div>Form not found.</div>;
  }

  const publication =
    "publications" in form && Array.isArray(form.publications)
      ? form.publications[0]
      : null;
  const publicSlug = resolvePublicSlug(
    form.name,
    form.id,
    publication?.publicSlug,
  );
  const isActive = form.status === "published" && publication?.isActive === true;
  const isDefaultLink = context.hotel.defaultFormId === form.id;
  const canBeDefault = form.status === "published";
  const expirationDateValue = publication?.endsAt
    ? new Date(publication.endsAt).toISOString().slice(0, 10)
    : "";
  const publicUrl = buildPublicSurveyUrl(publicSlug);
  const defaultSurveyUrl = buildHotelDefaultSurveyUrl(context.hotel.slug);
  const qrDataUrl = await QRCode.toDataURL(publicUrl, {
    margin: 1,
    width: 220,
    color: {
      dark: "#3f2a19",
      light: "#fffaf7",
    },
  });

  return (
    <div className="space-y-8">
      {error === "publish_first_before_default" ? (
        <Alert className="border-[#f2c6bf] bg-[#fff8f5] text-[#7d2b1f]">
          <CircleAlert className="size-4" />
          <AlertTitle>Publish this form first</AlertTitle>
          <AlertDescription>
            A draft form cannot become the account default link target. Publish the survey first, then mark it as default.
          </AlertDescription>
        </Alert>
      ) : null}

      {notice === "default_link_updated" ? (
        <Alert className="border-[#d8eadf] bg-[#f6fffa] text-[#14532d]">
          <CheckCircle2 className="size-4" />
          <AlertTitle>Default link updated</AlertTitle>
          <AlertDescription>
            The stable account link will now open this survey until another published form is marked as default.
          </AlertDescription>
        </Alert>
      ) : null}

      {notice === "publish_saved" ? (
        <Alert className="border-[#d8eadf] bg-[#f6fffa] text-[#14532d]">
          <CheckCircle2 className="size-4" />
          <AlertTitle>Publishing settings saved</AlertTitle>
          <AlertDescription>
            This survey is live and ready to accept guests.
          </AlertDescription>
        </Alert>
      ) : null}

      {notice === "unpublished" ? (
        <Alert className="border-[#e8d7ca] bg-[#fffaf7] text-[#7c4a1f]">
          <CheckCircle2 className="size-4" />
          <AlertTitle>Survey unpublished</AlertTitle>
          <AlertDescription>
            Guests can no longer access this survey link until it is published again.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-[24px] font-semibold leading-8 text-[#251912]">
            Publishing Settings
          </h1>
          <p className="text-base leading-6 text-[#584235]">
            Configure how guests will access and interact with the &quot;{form.name}&quot; survey.
          </p>
        </div>

        <form action={publishFormAction}>
          <input name="formId" type="hidden" value={form.id} />
          <input name="publicSlug" type="hidden" value={publicSlug} />
          <input name="mode" type="hidden" value="direct_link" />
          <input name="isActive" type="hidden" value={isActive ? "false" : "true"} />
          <Button
            className={
              isActive
                ? "h-12 rounded-xl border-[#d7b8a2] bg-white px-5 text-base font-semibold text-[#7d3c00] shadow-[0px_8px_24px_rgba(151,72,0,0.10)] hover:bg-[#fff8f5]"
                : "h-12 rounded-xl bg-[#974800] px-6 text-base font-semibold text-white shadow-[0px_12px_30px_rgba(151,72,0,0.28)] hover:bg-[#824000]"
            }
            type="submit"
            variant={isActive ? "outline" : "default"}
          >
            {isActive ? (
              <EyeOff data-icon="inline-start" />
            ) : (
              <Rocket data-icon="inline-start" />
            )}
            {isActive ? "Unpublish" : "Publish"}
          </Button>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_376px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="mb-4 flex items-center gap-3 border-b border-[#f5ded2] pb-3">
              <Link2 className="size-5 text-[#974800]" />
              <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
                Public Link
              </h2>
            </div>
            <p className="mb-4 text-sm leading-5 text-[#584235]">
              Share this link directly with guests via email or SMS campaigns.
            </p>
            <div className="flex flex-col gap-3 rounded-lg border border-[#dfc0af] bg-[#fff1ea] p-4 md:flex-row md:items-center md:justify-between">
              <p className="break-all pr-2 text-base leading-6 text-[#251912]">
                {publicUrl}
              </p>
              <CopyPublicLinkButton url={publicUrl} />
            </div>
          </section>

          {isDefaultLink ? (
            <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <div className="mb-4 flex items-center gap-3 border-b border-[#f5ded2] pb-3">
                <Link2 className="size-5 text-[#974800]" />
                <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
                  Default Survey Link
                </h2>
              </div>
              <p className="mb-4 text-sm leading-5 text-[#584235]">
                This is the stable link you can place in hotel systems. It does not
                change. Right now it points to this survey.
              </p>
              <div className="flex flex-col gap-3 rounded-lg border border-[#dfc0af] bg-[#fff8f5] p-4 md:flex-row md:items-center md:justify-between">
                <p className="break-all pr-2 text-base leading-6 text-[#251912]">
                  {defaultSurveyUrl}
                </p>
                <CopyPublicLinkButton url={defaultSurveyUrl} />
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[#f5ded2] bg-white p-6 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 border-b border-[#f5ded2] pb-3">
                  <QrCode className="size-5 text-[#974800]" />
                  <h2 className="font-heading text-[20px] font-semibold leading-7 text-[#251912]">
                    QR Code
                  </h2>
                </div>
                <p className="text-sm leading-5 text-[#584235]">
                  Download the QR code to place on physical collateral like in-room
                  tents, front desk displays, or receipts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a download={`${publicSlug}.png`} href={qrDataUrl}>
                    <Button
                      className="rounded-lg border-[#dfc0af] text-[#251912] hover:bg-[#fff8f5]"
                      type="button"
                      variant="outline"
                    >
                      Download PNG
                    </Button>
                  </a>
                  <a download={`${publicSlug}.svg`} href={qrDataUrl}>
                    <Button
                      className="rounded-lg border-[#dfc0af] text-[#251912] hover:bg-[#fff8f5]"
                      type="button"
                      variant="outline"
                    >
                      Download SVG
                    </Button>
                  </a>
                </div>
              </div>
              <div className="flex size-32 items-center justify-center rounded-lg border border-[#dfc0af] bg-[#fff8f5] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="QR code for survey link"
                  className="size-full rounded-[4px] object-cover mix-blend-multiply"
                  src={qrDataUrl}
                />
              </div>
            </div>
          </section>
        </div>

        <PublishAccessControlsForm
          canBeDefault={canBeDefault}
          expirationDateValue={expirationDateValue}
          formId={form.id}
          isActive={isActive}
          isDefaultLink={isDefaultLink}
          publicationMode={publication?.mode ?? "direct_link"}
          publicSlug={publicSlug}
        />
      </div>
    </div>
  );
}
