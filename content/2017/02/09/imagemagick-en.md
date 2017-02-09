+++
tags = ["ImageMagick"]
categories = ["ImageMagick"]
date = "2017-02-09"
title = "Behavior of policy changed from ImageMagick 6.9.7-7"
draft = false

+++

# Introduction

ImageMagick supports over hundred types of image formats. Even if one of them is vulnerable, it will be vulnerable to ImageMagick, so we need care to avoid accepting unnecessary image formats. Normally, we use policy.xml [^1] in the setting file to instruct permission(OK)/non-permission(NG) for each image format(codec).

From ImageMagick 6.9.7-7, how to apply the condition rule set in policy.xml has changed.

- ImageMagick-6.9.7-6 NG if there is even one NG (false winning) 
- ImageMagick-6.9.7-7 NG if the last matching rule is NG (after winning)

It's not listed in ChangeLog of ImageMagick 6.9.7-7.

# Improvement

Until now, there was even one NG rule and it was treated as NG. In this case, it can only be used with the blacklist method. For example, if there are image formats we do not want to read, list them all. It is troublesome and there seems to be a leak.

But this time, because it became the winning NG rule, if we first write * (wild card) to NG all and write a rule of OK only for images (PNG, JPEG, GIF etc.?) We want to allow behind that Other images will not be processed. It's very safe.

Even if we enumerate a large number of black lists until now, there is a leak, even if a new format is added to ImageMagick itself, or scanning the signature of the image binary, etc...

# Rule example

From ImageMagick - 6.9.7-7 we can make the following settings in policy.xml.

{{< highlight xml >}}
<policy domain="coder" rights="none" pattern="*" />
<policy domain="coder" rights="read|write" pattern="PNG" />
<policy domain="coder" rights="read|write" pattern="JPEG" />
<policy domain="coder" rights="read|write" pattern="GIF" />
{{< /highlight >}}

In ImageMagick - 6.9.7-6 and earlier, NG is determined by the * rule, and all image formats can not be processed.

Also, definition "all" has been added from 6.9.7-7. It represents all authorities. Specifically, it is the same as "read|write|execute".

{{< highlight xml >}}
<policy domain="coder" rights="none" pattern="*" />
<policy domain="coder" rights="all" pattern="PNG" />
<policy domain="coder" rights="all" pattern="JPEG" />
<policy domain="coder" rights="all" pattern="GIF" />
{{< /highlight >}}

# Source code diff

There is a difference in the IsRightsAuthorized function of magick/policy.c.

Policy_cache is a list of configuration entries. MagickFalse will be set if we do not have read, write, execute privileges, focusing on the corresponding entry in GlobExpression.

The way of setting this MagickFalse has been changed.

## ImageMagick-6.9.7-6

First, as authorized = MagickTrue, check the authority if it matches the rule (eg PNG) and assign MagickFalse if it's NG. Since there is no process to return to MagickTrue, if there is only one entry to be NG, it can not be flipped behind.

{{< highlight c >}}
authorized=MagickTrue;
<omit>
p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
  while ((p != (PolicyInfo *) NULL) && (authorized != MagickFalse))
{
  if ((p->domain == domain) &&
      (GlobExpression(pattern,p->pattern,MagickFalse) != MagickFalse))
    {
      if (((rights & ReadPolicyRights) != 0) &&
          ((p->rights & ReadPolicyRights) == 0))
        authorized=MagickFalse;
      if (((rights & WritePolicyRights) != 0) &&
          ((p->rights & WritePolicyRights) == 0))
        authorized=MagickFalse;
      if (((rights & ExecutePolicyRights) != 0) &&
          ((p->rights & ExecutePolicyRights) == 0))
        authorized=MagickFalse;
    }
  p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
}
{{< /highlight >}}

## ImageMagick-6.9.7-7

First, as authorized = MagickTrue, check the authority if it matches the rule (for example PNG) and if it's OK it will be MagickTrue, if NG then we will assign MagickFalse. It overwrites each entry found, so it will be the winning rule.

{{< highlight c >}}
authorized=MagickTrue;
<omit>
p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
while (p != (PolicyInfo *) NULL)
{
  if ((p->domain == domain) &&
      (GlobExpression(pattern,p->pattern,MagickFalse) != MagickFalse))
    {
      if ((rights & ReadPolicyRights) != 0)
        authorized=(p->rights & ReadPolicyRights) != 0;
      if ((rights & WritePolicyRights) != 0)
        authorized=(p->rights & WritePolicyRights) != 0;
      if ((rights & ExecutePolicyRights) != 0)
        authorized=(p->rights & ExecutePolicyRights) != 0;
    }
  p=(PolicyInfo *) GetNextValueInLinkedList(policy_cache);
}
{{< /highlight >}}

# Conclusion

It's a nice feature change to us, but I think that it was better to have an official announcement because the behavior has changed clearly.

[^1]: Specifically, there are files in the following places -> &lt;prefix&gt;/etc/ImageMagick-6/policy.xml
