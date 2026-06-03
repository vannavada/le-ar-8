import { describe, it, expect } from "vitest";
import {
  buildAffiliateUrl,
  hasAffiliateContent,
  parseKeyValueBlock,
  type AffiliateProgramMeta,
} from "@/lib/affiliate";

function makeAmazonProgram(affiliateId: string): AffiliateProgramMeta {
  return { id: "amazon-us", name: "Amazon US", network: "amazon", affiliateId, baseUrl: "" };
}

describe("buildAffiliateUrl — Amazon network", () => {
  describe("ASIN input (10 alphanumeric chars)", () => {
    it("clean ASIN → standard Amazon dp URL with ?tag= from program", () => {
      const prog = makeAmazonProgram("lear8-20");
      const url = buildAffiliateUrl(prog, "B08N5WRWNW");
      expect(url).toBe("https://www.amazon.com/dp/B08N5WRWNW?tag=lear8-20");
    });

    it("tag comes from program.affiliateId, not hardcoded", () => {
      const prog = makeAmazonProgram("my-custom-tag-99");
      const url = buildAffiliateUrl(prog, "B01ABCDE123".slice(0, 10));
      expect(url).toContain("tag=my-custom-tag-99");
      expect(url).not.toContain("lear8-20");
    });

    it("lowercase ASIN is accepted (regex is case-insensitive)", () => {
      const prog = makeAmazonProgram("lear8-20");
      const url = buildAffiliateUrl(prog, "b08n5wrwnw");
      expect(url).toContain("tag=lear8-20");
      expect(url).toContain("/dp/b08n5wrwnw");
    });
  });

  describe("full URL input", () => {
    it("full Amazon URL → tag appended, existing params preserved", () => {
      const prog = makeAmazonProgram("lear8-20");
      const url = buildAffiliateUrl(prog, "https://www.amazon.com/dp/B08N5WRWNW?ref=sr_1");
      const parsed = new URL(url);
      expect(parsed.searchParams.get("tag")).toBe("lear8-20");
      expect(parsed.searchParams.get("ref")).toBe("sr_1");
    });

    it("full URL with existing stale tag → tag is overwritten", () => {
      const prog = makeAmazonProgram("lear8-20");
      const url = buildAffiliateUrl(prog, "https://www.amazon.com/dp/B08N5WRWNW?tag=old-tag");
      const parsed = new URL(url);
      expect(parsed.searchParams.get("tag")).toBe("lear8-20");
    });

    it("tag in full URL comes from program, not hardcoded", () => {
      const prog = makeAmazonProgram("custom-tag-99");
      const url = buildAffiliateUrl(prog, "https://www.amazon.com/dp/B08N5WRWNW");
      expect(new URL(url).searchParams.get("tag")).toBe("custom-tag-99");
    });
  });
});

describe("buildAffiliateUrl — non-Amazon network", () => {
  it("unknown network returns input unchanged", () => {
    const prog: AffiliateProgramMeta = {
      id: "x",
      name: "ShareASale",
      network: "shareasale",
      affiliateId: "12345",
      baseUrl: "",
    };
    const input = "https://example.com/product?id=foo";
    expect(buildAffiliateUrl(prog, input)).toBe(input);
  });
});

describe("hasAffiliateContent", () => {
  it("body with amazon.com link → true", () => {
    expect(hasAffiliateContent("Check this out at amazon.com/dp/B001")).toBe(true);
  });

  it("body with amzn.to shortlink → true", () => {
    expect(hasAffiliateContent("Buy it here: amzn.to/3abcXYZ")).toBe(true);
  });

  it("body with product-card fence → true", () => {
    expect(hasAffiliateContent("```product-card\ntitle: Foo\n```")).toBe(true);
  });

  it("body with nestmargin.com → true", () => {
    expect(hasAffiliateContent("Learn more at nestmargin.com for details.")).toBe(true);
  });

  it("body with nestmargin-cta fence → true", () => {
    expect(hasAffiliateContent("```nestmargin-cta\n```")).toBe(true);
  });

  it("plain editorial text → false", () => {
    expect(hasAffiliateContent("This is a regular article with no affiliate content.")).toBe(false);
  });

  it("empty string → false", () => {
    expect(hasAffiliateContent("")).toBe(false);
  });
});

describe("parseKeyValueBlock", () => {
  it("parses standard key: value lines", () => {
    const result = parseKeyValueBlock("title: My Product\nprice: $19.99\nasin: B08N5WRWNW");
    expect(result).toEqual({ title: "My Product", price: "$19.99", asin: "B08N5WRWNW" });
  });

  it("value with colon is preserved (only first colon splits)", () => {
    const result = parseKeyValueBlock("url: https://example.com/path");
    expect(result.url).toBe("https://example.com/path");
  });

  it("lines without colon are skipped", () => {
    const result = parseKeyValueBlock("no colon here\nkey: value");
    expect(result).toEqual({ key: "value" });
  });

  it("empty string returns empty object", () => {
    expect(parseKeyValueBlock("")).toEqual({});
  });

  it("keys and values are trimmed of surrounding whitespace", () => {
    const result = parseKeyValueBlock("  title :  Product Name  ");
    expect(result.title).toBe("Product Name");
  });
});
