namespace ApiTrocaLivros.Functions;

using System.Globalization;
using System.Text;

public static class StringExtensions
{
    /// <summary>
    /// Remove acentos (diacríticos) e coloca tudo em lower‑case.
    /// </summary>
    public static string Standardize(this string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // 1) Descompor em caracteres base + diacríticos
        var normalized = text.Normalize(NormalizationForm.FormD);

        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            // ignora os “NonSpacingMark” (acentos, cedilhas, etc)
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        // 2) Recompacta e coloca em minusculas
        return sb
            .ToString()
            .Normalize(NormalizationForm.FormC)
            .ToLowerInvariant();
    }
}

